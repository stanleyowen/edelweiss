function validateKeywords(category, message) {
  // Get category and save the category keywords to key
  let key = [];
  let isCategory = false;
  if (category === "okay") key = ["ya", "sip", "yup", "ok", "ye"];
  if (category === "laugh") key = ["wk", "ha", "lol"];

  // Loop each keyword in key and check if the message contains the following keywords
  key.forEach((keyword) => {
    if (message.includes(keyword))
      // Use OR method to make sure it returns true when the previous state is false
      isCategory = isCategory || true;
  });

  return isCategory;
}

function removeDuplicates(str) {
  // Split words into an array
  const sentences = [];
  const words = str.split(" ");

  // Remove duplicates from each word and push to sentences
  words.forEach((word) => {
    sentences.push([...new Set(word.split(""))].join(""));
  });

  return sentences.join(" ");
}

module.exports = { validateKeywords, removeDuplicates };
