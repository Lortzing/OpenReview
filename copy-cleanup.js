(function(){
  const prefixPattern = /^从(?:总集|人工智能子集|生物医学子集|物理学子集)图形本身看，\s*/;
  document.querySelectorAll('.figure figcaption p').forEach((paragraph) => {
    paragraph.textContent = paragraph.textContent.replace(prefixPattern, '');
  });
  const footer = document.querySelector('.footer');
  if (footer) footer.remove();
})();
