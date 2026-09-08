/* 尽早续接顶部进度条（须放在 <head>，body 尚未存在） */
(function () {
  var KEY = 'arco-pro-nav-progress';
  try {
    if (
      sessionStorage.getItem(KEY) !== '1' &&
      sessionStorage.getItem('vibepack-preview:' + KEY) !== '1'
    ) {
      return;
    }
  } catch (e) {
    return;
  }
  document.documentElement.classList.add('is-page-loading');
  var host = document.createElement('div');
  host.id = 'arco-pro-nprogress-early';
  host.innerHTML = '<div class="bar" role="bar"><div class="peg"></div></div>';
  document.documentElement.appendChild(host);
})();
