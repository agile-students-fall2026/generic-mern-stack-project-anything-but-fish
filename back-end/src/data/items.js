"use strict";

// Shared item definitions. Ownership and counts live in each player's profile.
const inventoryCapacity = 20;
const itemCatalog = [
  { id: "ancient-coin", name: "Ancient gold coin", type: "Relic", icon: "coin", description: "A worn coin recovered from the investigators' belongings. Its markings match a warning in their field notes." },
  /* Reserved for later inventory content.
  { id: "archive-key", name: "Archive key", type: "Key", icon: "key", description: "A small brass key with a faded paper tag. The room number is almost impossible to read." },
  { id: "field-notebook", name: "Field notebook", type: "Document", icon: "notebook", description: "One investigator's handwritten notes. Several pages are marked with questions that were never answered." },
  { id: "radio-tape", name: "Recorded tape", type: "Recording", icon: "tape", description: "A tape found beside the old radio. A date and two initials are written on its label." },
  { id: "old-photograph", name: "Old photograph", type: "Photograph", icon: "photograph", description: "A photograph of the two investigators before their final assignment. The location has been circled on the back." },
  */
];

module.exports = { inventoryCapacity, itemCatalog };
