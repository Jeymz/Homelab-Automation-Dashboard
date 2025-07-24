function splitDiffByFile(diffText) {
  if (!diffText || typeof diffText !== 'string') throw new Error('Invalid diff text received');
  const files = diffText.split('diff --git ');
  const fileDiffs = {};
  files.slice(1).forEach((block) => {
    const headerLine = block.split('\n')[0];
    const filename = headerLine.split(' b/').pop().trim();
    fileDiffs[filename] = `diff --git ${block.trim()}`;
  });
  return fileDiffs;
}

module.exports = { splitDiffByFile };
