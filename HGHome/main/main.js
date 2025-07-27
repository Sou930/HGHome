// DOMが読み込まれてから実行
document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.menu-btn');
  const sections = document.querySelectorAll('.section');
  const selectionItems = document.querySelectorAll('.selection-item');
  const selectedDisplay = document.getElementById('selected-display');
  const studyContent = document.getElementById('study-content');
  
  let selectedItems = {
    language: [],
    programming: []
  };

  // タブ切り替え機能
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // 全てのセクションを非表示にする
      sections.forEach(section => {
        section.classList.remove('active');
      });

      // 対象だけ表示
      const target = button.getAttribute('data-target');
      const targetSection = document.getElementById(target);
      if (targetSection) {
        targetSection.classList.add('active');
      }

      // ボタンのアクティブ切替
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // 学習項目選択機能
  selectionItems.forEach(item => {
    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category');
      const value = item.getAttribute('data-value');
      const title = item.querySelector('.item-title').textContent;
      const icon = item.querySelector('.item-icon').textContent;
      
      if (item.classList.contains('selected')) {
        // 選択解除
        item.classList.remove('selected');
        selectedItems[category] = selectedItems[category].filter(selected => selected.value !== value);
      } else {
        // 選択追加
        item.classList.add('selected');
        selectedItems[category].push({
          value: value,
          title: title,
          icon: icon,
          category: category
        });
      }
      
      updateSelectedDisplay();
      loadStudyContent();
    });
  });

  // 選択項目表示更新
  function updateSelectedDisplay() {
    const allSelected = [...selectedItems.language, ...selectedItems.programming];
    
    if (allSelected.length === 0) {
      selectedDisplay.innerHTML = '<span class="no-selection">まだ何も選択されていません</span>';
      return;
    }
    
    selectedDisplay.innerHTML = allSelected.map(item => `
      <div class="selected-tag" data-category="${item.category}" data-value="${item.value}">
        <span>${item.icon} ${item.title}</span>
        <span class="remove-tag">×</span>
      </div>
    `).join('');
    
    // タグクリックで内容表示
    selectedDisplay.querySelectorAll('.selected-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-tag')) {
          // 削除処理
          const category = tag.getAttribute('data-category');
          const value = tag.getAttribute('data-value');
          
          selectedItems[category] = selectedItems[category].filter(selected => selected.value !== value);
          
          const selectionItem = document.querySelector(`[data-category="${category}"][data-value="${value}"]`);
          if (selectionItem) {
            selectionItem.classList.remove('selected');
          }
          
          updateSelectedDisplay();
          loadStudyContent();
        } else {
          // 内容表示
          const value = tag.getAttribute('data-value');
          loadSpecificContent(value);
        }
      });
    });
  }

  // 学習内容を読み込む
  async function loadStudyContent() {
    const allSelected = [...selectedItems.language, ...selectedItems.programming];
    
    if (allSelected.length === 0) {
      studyContent.innerHTML = '';
      return;
    }
    
    let contentHtml = '';
    
    for (const item of allSelected) {
      try {
        const response = await fetch(`study/${item.value}.txt`);
        if (response.ok) {
          const content = await response.text();
          contentHtml += `<h2>${item.icon} ${item.title}</h2>\n${content}\n\n`;
        } else {
          contentHtml += `<h2>${item.icon} ${item.title}</h2>\n<p>コンテンツファイルが見つかりません: study/${item.value}.txt</p>\n\n`;
        }
      } catch (error) {
        contentHtml += `<h2>${item.icon} ${item.title}</h2>\n<p>コンテンツの読み込みに失敗しました。</p>\n\n`;
      }
    }
    
    studyContent.innerHTML = formatContent(contentHtml);
  }

  // 特定の内容のみ表示
  async function loadSpecificContent(value) {
    try {
      const response = await fetch(`study/${value}.txt`);
      if (response.ok) {
        const content = await response.text();
        const selectedItem = [...selectedItems.language, ...selectedItems.programming]
          .find(item => item.value === value);
        const title = selectedItem ? `${selectedItem.icon} ${selectedItem.title}` : value;
        studyContent.innerHTML = formatContent(`<h1>${title}</h1>\n${content}`);
      } else {
        studyContent.innerHTML = `<p>コンテンツファイルが見つかりません: study/${value}.txt</p>`;
      }
    } catch (error) {
      studyContent.innerHTML = `<p>コンテンツの読み込みに失敗しました。</p>`;
    }
  }

  // コンテンツの簡単なフォーマット
  function formatContent(content) {
    return content
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1');
  }
});