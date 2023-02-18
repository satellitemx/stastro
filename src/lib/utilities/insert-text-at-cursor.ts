// Thanks ChatGPT :)

const insertTextAtCursor = (text: string) => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  
  const newRange = document.createRange();
  newRange.setStart(textNode, textNode.length);
  newRange.setEnd(textNode, textNode.length);
  selection.removeAllRanges();
  selection.addRange(newRange);
};

export default insertTextAtCursor