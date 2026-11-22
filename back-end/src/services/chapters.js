"use strict";

const { getChapter } = require("../data/chapters");
const { getStoryFact } = require("../data/storyFacts");
const { HttpError } = require("../routes/auth");
const {
  updatePlayerProfile,
  applyProfileUnlocks,
  getUnlockedFactIds,
  listUnlockedCharacters,
} = require("./playerProfiles");
const { applyItemReward, inventoryFor } = require("./inventory");

function requireChapter(chapterId) {
  const chapter = getChapter(chapterId);
  if (!chapter) throw new HttpError(404, "Chapter not found.");
  return chapter;
}

function entryIndex(chapter, entryId) {
  if (!Number.isSafeInteger(entryId))
    throw new HttpError(400, "Provide a numeric story entry ID.");
  const index = chapter.entryIds.indexOf(entryId);
  if (index < 0)
    throw new HttpError(
      400,
      "This story entry does not belong to the chapter.",
    );
  return index;
}

function progressFor(profile, chapterId) {
  requireChapter(chapterId);
  const entry = (profile.chapterProgress || []).find(
    (item) => item.chapterId === chapterId,
  );
  return {
    chapterId,
    entryId: entry?.lastEntryId ?? null,
    furthestEntryId: entry?.furthestEntryId ?? null,
    completedAt: entry?.completedAt ?? null,
  };
}

function applyChapterUnlocks(profile, chapter, reachedIndex, complete = false) {
  const characterIds = chapter.characterUnlocks
    .filter((event) => {
      const index = chapter.entryIds.indexOf(event.entryId);
      return index >= 0 && index <= reachedIndex;
    })
    .map((event) => event.characterId);
  const factIds = chapter.factIds.filter((factId) => {
    const fact = getStoryFact(factId);
    if (!fact || fact.chapterId !== chapter.id) return false;
    if (fact.completionOnly) return complete;
    const index = chapter.entryIds.indexOf(fact.unlockEntryId);
    return index >= 0 && index <= reachedIndex;
  });
  applyProfileUnlocks(profile, { characterIds, factIds });
}

async function recordProgress(models, userId, chapterId, entryId) {
  const chapter = requireChapter(chapterId);
  const index = entryIndex(chapter, entryId);
  const { profile } = await updatePlayerProfile(models, userId, (draft) => {
    let progress = draft.chapterProgress.find(
      (entry) => entry.chapterId === chapterId,
    );
    const previousIndex = progress
      ? chapter.entryIds.indexOf(progress.furthestEntryId)
      : -1;
    if (index > previousIndex + 1)
      throw new HttpError(
        409,
        "Continue from your saved progress before opening this part of the story.",
      );
    if (!progress) {
      progress = {
        chapterId,
        lastEntryId: entryId,
        furthestEntryId: entryId,
        completedAt: null,
      };
      draft.chapterProgress.push(progress);
    } else {
      progress.lastEntryId = entryId;
      if (index > previousIndex) progress.furthestEntryId = entryId;
    }
    applyChapterUnlocks(
      draft,
      chapter,
      Math.max(previousIndex, index),
      Boolean(progress.completedAt),
    );
  });
  return progressFor(profile, chapterId);
}

async function completeChapter(models, userId, chapterId) {
  const chapter = requireChapter(chapterId);
  const { profile, result } = await updatePlayerProfile(
    models,
    userId,
    (draft) => {
      const progress = draft.chapterProgress.find(
        (entry) => entry.chapterId === chapterId,
      );
      if (!progress || progress.furthestEntryId !== chapter.entryIds.at(-1)) {
        throw new HttpError(
          409,
          "Reach the end of this chapter before completing it.",
        );
      }
      const alreadyCompleted = Boolean(progress.completedAt);
      progress.completedAt ||= new Date();
      applyChapterUnlocks(draft, chapter, chapter.entryIds.length - 1, true);
      const awardedItems = applyItemReward(
        draft,
        `chapter-${chapterId}`,
        chapter.rewards,
      );
      return { alreadyCompleted, awardedItems };
    },
  );
  return { progress: progressFor(profile, chapterId), ...result };
}

async function unlockReachedEntry(models, userId, chapterId, entryId) {
  const chapter = requireChapter(chapterId);
  const index = entryIndex(chapter, entryId);
  const { profile } = await updatePlayerProfile(models, userId, (draft) => {
    const progress = draft.chapterProgress.find(
      (entry) => entry.chapterId === chapterId,
    );
    if (
      !progress ||
      index > chapter.entryIds.indexOf(progress.furthestEntryId)
    ) {
      throw new HttpError(
        409,
        "Read this part of the story before unlocking its discoveries.",
      );
    }
    applyChapterUnlocks(draft, chapter, index, Boolean(progress.completedAt));
  });
  return {
    unlockedCharacterIds: listUnlockedCharacters(profile).map(
      (entry) => entry.name,
    ),
    unlockedFactIds: getUnlockedFactIds(profile),
  };
}

async function claimChapterReward(models, userId, chapterId) {
  const chapter = requireChapter(chapterId);
  const { profile, result: awardedItems } = await updatePlayerProfile(
    models,
    userId,
    (draft) => {
      if (
        !draft.chapterProgress.some(
          (entry) => entry.chapterId === chapterId && entry.completedAt,
        )
      ) {
        throw new HttpError(
          409,
          "Complete this chapter before collecting its reward.",
        );
      }
      return applyItemReward(draft, `chapter-${chapterId}`, chapter.rewards);
    },
  );
  return { ...inventoryFor(profile), awardedItems };
}

module.exports = {
  progressFor,
  recordProgress,
  completeChapter,
  unlockReachedEntry,
  claimChapterReward,
};
