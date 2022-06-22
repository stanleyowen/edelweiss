function removeDuplicates(str) {
  const sentences = [];
  const words = str.split(" ");

  words.forEach((word) => {
    sentences.push([...new Set(word.split(""))].join(""));
  });

  return sentences.join(" ");
}

module.exports = removeDuplicates;
