import fs from 'fs'

/**
 * Generate frame/admin HTML shells from the V version table.
 * Run from frame/admin: node scripts/generate-html.mjs
 */
const APP_TITLE = 'Vibe Design Pro'

const V = {
  fa: '7.2.0-sharp1',
  faIcons: '1.2.40',
  faIconsCss: '1.2.9',
  settings: '1.2.18',
  locale: '1.2.75',
  arcoTheme: '1.3.5',
  chartPalette: '1.0.6',
  shell: '1.2.49',
  boot: '1.2.25',
  layout: '1.2.85',
  arcoThemePro: '1.0.69',
  pagesCommon: '1.0.77',
  shadcnChartCss: '1.0.91',
  shadcnChart: '1.0.99',
  shadcnChartCssDash: '1.0.92',
  shadcnChartDash: '1.1.0',
  routes: '1.2.29',
  avatarCrop: '1.0.2',
  auth: '1.2.9',
  mockData: '1.2.10',
  tabBar: '1.0.1',
  pageProgress: '1.0.1',
  loginCss: '1.0.25',
  loginCoverCss: '1.0.13',
  loginSplitCss: '1.0.17',
  loginBannerCss: '1.0.12',
  loginCoverJs: '1.0.15',
  loginSplitJs: '1.0.15',
  loginBannerJs: '1.0.12',
}

const chartScripts = [
  './vendor/unovis/unovis.min.js',
  `./js/charts/shadcn-charts.js?v=${V.shadcnChart}`,
]

const avatarCropScripts = [`./js/avatar-crop.js?v=${V.avatarCrop}`]

// Titles use \uXXXX escapes so this file stays ASCII-safe under any editor encoding.
const pages = [
  { file: 'dashboard.html', title: '\u6570\u636e\u6982\u89c8', css: [`./css/workplace.css?v=1.0.15`, `./css/shadcn-chart.css?v=${V.shadcnChartCss}`], js: './js/pages/workplace.js?v=1.0.12', charts: true },
  { file: 'list-search-table.html', title: '\u6570\u636e\u5217\u8868', css: ['./css/list-search-table.css?v=1.0.0'], js: './js/pages/list-search-table.js?v=1.1.50' },
  { file: 'list-card.html', title: '\u5361\u7247\u5217\u8868', css: ['./css/list-card.css?v=1.0.3'], js: './js/pages/list-card.js?v=1.0.4' },
  { file: 'list-kanban.html', title: '\u4efb\u52a1\u770b\u677f', css: ['./css/list-kanban.css?v=1.0.16'], js: './js/pages/list-kanban.js?v=1.0.13' },
  { file: 'list-tree-table.html', title: '\u5de6\u6811\u53f3\u8868', css: ['./css/list-tree-table.css?v=1.0.7'], js: './js/pages/list-tree-table.js?v=1.2.10' },
  { file: 'list-filter-table.html', title: '\u5de6\u7b5b\u53f3\u8868', css: ['./css/list-filter-table.css?v=1.0.16'], js: './js/pages/list-filter-table.js?v=1.0.16' },
  { file: 'list-tag-filter.html', title: '\u6807\u7b7e\u7b5b\u9009', css: ['./css/list-tag-filter.css?v=1.0.6'], js: './js/pages/list-tag-filter.js?v=1.0.14' },
  { file: 'list-master-detail.html', title: '\u5206\u680f\u8be6\u60c5\u9875', css: ['./css/list-master-detail.css?v=1.0.1'], js: './js/pages/list-master-detail.js?v=1.0.1' },
  { file: 'list-editable.html', title: '\u884c\u5185\u7f16\u8f91', css: ['./css/form.css?v=1.0.62', './css/list-editable.css?v=1.0.1'], js: './js/pages/list-editable.js?v=1.0.7' },
  { file: 'list-calendar.html', title: '\u65e5\u5386\u9875\u9762', css: ['./css/list-calendar.css?v=1.0.0'], js: './js/pages/list-calendar.js?v=1.0.0' },
  { file: 'list-media.html', title: '\u6587\u4ef6\u7ba1\u7406', css: ['./css/list-media.css?v=1.0.0'], js: './js/pages/list-media.js?v=1.0.0' },
  { file: 'list-import.html', title: '\u5bfc\u5165\u5411\u5bfc', css: ['./css/list-import.css?v=1.0.0'], js: './js/pages/list-import.js?v=1.0.0' },
  { file: 'component-basic.html', title: '\u57fa\u7840\u7ec4\u4ef6', css: ['./css/component-showcase.css?v=1.0.84'], js: './js/pages/component-basic.js?v=1.0.61' },
  { file: 'component-extended.html', title: '\u6269\u5c55\u7ec4\u4ef6', css: ['./css/component-showcase.css?v=1.0.84'], js: './js/pages/component-extended.js?v=1.0.4' },
  { file: 'component-chart.html', title: '\u5e38\u7528\u56fe\u8868', css: [`./css/component-showcase.css?v=1.0.129`, `./css/shadcn-chart.css?v=${V.shadcnChartCss}`, './css/dashboard-crm.css?v=1.0.40'], js: './js/pages/component-chart.js?v=1.0.86', charts: true },
  { file: 'component-chart-extended.html', title: '\u6269\u5c55\u56fe\u8868', css: [`./css/component-showcase.css?v=1.0.91`, `./css/shadcn-chart.css?v=${V.shadcnChartCss}`, './css/dashboard-ecommerce.css?v=1.0.42', './css/component-chart-extended.css?v=1.0.19'], js: './js/pages/component-chart-extended.js?v=1.0.31', charts: true },
  { file: 'component-rich-text.html', title: '\u5bcc\u6587\u672c\u7ec4\u4ef6', css: ['./css/component-showcase.css?v=1.0.84'], js: './js/pages/component-rich-text.js?v=1.0.1' },
  { file: 'component-metric-card.html', title: '\u6307\u6807\u5361\u7247', css: ['./css/list-card.css?v=1.0.3'], js: './js/pages/component-metric-card.js' },
  { file: 'component-chart-palette.html', title: '\u56fe\u8868\u914d\u8272', css: ['./css/component-showcase.css?v=1.0.84', './css/component-chart-palette.css?v=1.0.3'], js: './js/pages/component-chart-palette.js?v=1.0.12' },
  { file: 'component-form.html', title: '\u8868\u5355\u7ec4\u4ef6', css: ['./css/component-form.css?v=1.0.50'], js: './js/pages/component-form.js?v=1.1.50' },
  { file: 'component-form-extended.html', title: '\u6269\u5c55\u8868\u5355', css: ['./css/component-form.css?v=1.0.50', './css/component-form-extended.css?v=1.0.1'], js: './js/pages/component-form-extended.js?v=1.0.11' },
  { file: 'component-table-extended.html', title: '\u8868\u683c\u7ec4\u4ef6', css: ['./css/component-showcase.css?v=1.0.85'], js: './js/pages/component-table-extended.js?v=1.0.5' },
  { file: 'component-list.html', title: '\u5217\u8868\u7ec4\u4ef6', css: ['./css/component-showcase.css?v=1.0.80', './css/component-list.css?v=1.0.0'], js: './js/pages/component-list.js?v=1.0.0' },
  { file: 'form-basic.html', title: '\u57fa\u7840\u8868\u5355', css: ['./css/form.css?v=1.0.62'], js: './js/pages/form-basic.js?v=1.0.9' },
  { file: 'form-group.html', title: '\u5206\u7ec4\u8868\u5355', css: ['./css/form.css?v=1.0.62'], js: './js/pages/form-group.js?v=1.0.9' },
  { file: 'form-step.html', title: '\u5206\u6b65\u8868\u5355', css: ['./css/form.css?v=1.0.62'], js: './js/pages/form-step.js?v=1.1.13' },
  { file: 'form-step-vertical.html', title: '\u7eb5\u5411\u5206\u5e03', css: ['./css/form.css?v=1.0.62'], js: './js/pages/form-step-vertical.js?v=1.0.22' },
  { file: 'profile-basic.html', title: '\u57fa\u7840\u8be6\u60c5\u9875', css: ['./css/profile.css?v=1.1.4'], js: './js/pages/profile-basic.js?v=1.2.1' },
  { file: 'profile-advanced.html', title: '\u9ad8\u7ea7\u8be6\u60c5\u9875', css: ['./css/profile.css?v=1.1.4'], js: './js/pages/profile-advanced.js?v=1.0.7' },
  { file: 'result-success.html', title: '\u6210\u529f\u9875\u9762', css: ['./css/result-exception.css?v=1.0.9'], js: './js/pages/result-page.js?v=1.0.5', meta: { type: 'success' } },
  { file: 'result-waiting.html', title: '\u7b49\u5f85\u9875\u9762', css: ['./css/result-exception.css?v=1.0.9'], js: './js/pages/result-page.js?v=1.0.5', meta: { type: 'waiting' } },
  { file: 'result-warning.html', title: '\u8b66\u544a\u9875\u9762', css: ['./css/result-exception.css?v=1.0.9'], js: './js/pages/result-page.js?v=1.0.5', meta: { type: 'warning' } },
  { file: 'result-error.html', title: '\u5931\u8d25\u9875\u9762', css: ['./css/result-exception.css?v=1.0.9'], js: './js/pages/result-page.js?v=1.0.5', meta: { type: 'error' } },
  { file: 'exception-403.html', title: '403', css: ['./css/result-exception.css?v=1.0.9'], js: './js/pages/exception-page.js?v=1.0.4', meta: { code: '403' } },
  { file: 'exception-404.html', title: '404', css: ['./css/result-exception.css?v=1.0.9'], js: './js/pages/exception-page.js?v=1.0.4', meta: { code: '404' } },
  { file: 'exception-500.html', title: '500', css: ['./css/result-exception.css?v=1.0.9'], js: './js/pages/exception-page.js?v=1.0.4', meta: { code: '500' } },
  { file: 'user-home.html', title: '\u4e2a\u4eba\u4e3b\u9875', css: ['./css/user.css?v=1.1.1'], js: './js/pages/user-home.js?v=1.0.1', avatarCrop: true },
  { file: 'user-setting.html', title: '\u7528\u6237\u8bbe\u7f6e', css: ['./css/user.css?v=1.1.1'], js: './js/pages/user-setting.js?v=1.0.2', avatarCrop: true },
  { file: 'message-list.html', title: '\u6d88\u606f\u7ba1\u7406', css: ['./css/message-list.css?v=1.0.3'], js: './js/pages/message-list.js?v=1.0.11' },
]

const loginPages = [
  {
    file: 'login-cover.html',
    css: [`./css/login.css?v=${V.loginCss}`, `./css/login-cover.css?v=${V.loginCoverCss}`],
    js: `./js/login-cover.js?v=${V.loginCoverJs}`,
  },
  {
    file: 'login-split.html',
    css: [`./css/login.css?v=${V.loginCss}`, `./css/login-split.css?v=${V.loginSplitCss}`],
    js: `./js/login-split.js?v=${V.loginSplitJs}`,
  },
  {
    file: 'login-banner.html',
    css: [`./css/login.css?v=${V.loginCss}`, `./css/login-banner.css?v=${V.loginBannerCss}`],
    js: `./js/login-banner.js?v=${V.loginBannerJs}`,
  },
]

const dashboardVariants = [
  {
    file: 'dashboard-productivity.html',
    title: '\u6548\u7387\u534f\u4f5c',
    css: ['./css/dashboard-productivity.css?v=1.0.34'],
    js: './js/pages/dashboard-productivity.js?v=1.0.29',
  },
  {
    file: 'dashboard-finance.html',
    title: '\u8d22\u52a1\u7ba1\u7406',
    css: ['./css/dashboard-finance.css?v=1.0.39'],
    js: './js/pages/dashboard-finance.js?v=1.0.24',
    charts: true,
  },
  {
    file: 'dashboard-ecommerce.html',
    title: '\u7535\u5546\u8fd0\u8425',
    css: ['./css/dashboard-ecommerce.css?v=1.0.44'],
    js: './js/pages/dashboard-ecommerce.js?v=1.0.45',
    charts: true,
    mocks: ['./js/mock-ecommerce-orders.js?v=1.0.0'],
  },
  {
    file: 'dashboard-customer.html',
    title: '\u5ba2\u6237\u6d1e\u5bdf',
    css: ['./css/dashboard-customer.css?v=1.0.11'],
    js: './js/pages/dashboard-customer.js?v=1.0.18',
    charts: true,
    mocks: ['./js/mock-customer-dashboard.js?v=1.0.0'],
  },
  {
    file: 'dashboard-crm.html',
    title: '\u5ba2\u6237\u5173\u7cfb',
    css: ['./css/dashboard-crm.css?v=1.0.40'],
    js: './js/pages/dashboard-crm.js?v=1.0.43',
    charts: true,
    mocks: ['./js/mock-crm-opportunities.js?v=1.0.0'],
  },
  {
    file: 'dashboard-banking.html',
    title: '\u91d1\u878d\u94f6\u884c',
    css: ['./css/dashboard-banking.css?v=1.0.12'],
    js: './js/pages/dashboard-banking.js?v=1.0.8',
    charts: true,
  },
  {
    file: 'dashboard-analytics.html',
    title: '\u7ecf\u8425\u5206\u6790',
    css: ['./css/dashboard-analytics.css?v=1.0.24'],
    js: './js/pages/dashboard-analytics.js?v=1.0.29',
    charts: true,
  },
  {
    file: 'dashboard-academy.html',
    title: '\u6559\u80b2\u57f9\u8bad',
    css: ['./css/dashboard-academy.css?v=1.0.26'],
    js: './js/pages/dashboard-academy.js?v=1.0.18',
    charts: true,
  },
]

const baseCss = [
  `./vendor/fontawesome/css/all.min.css?v=${V.fa}`,
  `./vendor/fontawesome/css/sharp-light.css?v=${V.fa}`,
  `./css/fa-icons.css?v=${V.faIconsCss}`,
  `./css/arco-theme-pro.css?v=${V.arcoThemePro}`,
  `./css/layout.css?v=${V.layout}`,
  `./css/pages-common.css?v=${V.pagesCommon}`,
]

const shellScripts = [
  './vendor/vue/vue.global.prod.js',
  './vendor/arco/arco-vue.min.js',
  `./js/fa-icons.js?v=${V.faIcons}`,
  `./js/settings.js?v=${V.settings}`,
  `./js/locale.js?v=${V.locale}`,
  `./js/auth.js?v=${V.auth}`,
  `./js/routes.js?v=${V.routes}`,
  `./js/mock-data.js?v=${V.mockData}`,
  `./js/arco-theme.js?v=${V.arcoTheme}`,
  `./js/shell.js?v=${V.shell}`,
  `./js/boot.js?v=${V.boot}`,
]

const loginScripts = [
  './vendor/vue/vue.global.prod.js',
  './vendor/arco/arco-vue.min.js',
  `./js/fa-icons.js?v=${V.faIcons}`,
  `./js/settings.js?v=${V.settings}`,
  `./js/locale.js?v=${V.locale}`,
  `./js/auth.js?v=${V.auth}`,
  `./js/arco-theme.js?v=${V.arcoTheme}`,
]

const dashboardScriptsBody = [
  './vendor/nprogress/nprogress.js',
  `./js/page-progress.js?v=${V.pageProgress}`,
  `./js/fa-icons.js?v=${V.faIcons}`,
  `./js/settings.js?v=${V.settings}`,
  `./js/locale.js?v=${V.locale}`,
  `./js/auth.js?v=${V.auth}`,
  `./js/routes.js?v=${V.routes}`,
  `./js/mock-data.js?v=${V.mockData}`,
  `./js/arco-theme.js?v=${V.arcoTheme}`,
  `./js/shell.js?v=${V.shell}`,
  `./js/tab-bar.js?v=${V.tabBar}`,
  `./js/boot.js?v=${V.boot}`,
]

function linkTags(hrefs) {
  return hrefs.map((href) => `  <link rel="stylesheet" href="${href}" />`).join('\n')
}

function scriptTags(srcs) {
  return srcs.map((src) => `  <script src="${src}"></script>`).join('\n')
}

function writeFile(file, html) {
  fs.writeFileSync(file, html, 'utf8')
  console.log('wrote', file)
}

function writeShellPage(p) {
  const cssLinks = linkTags(['./fonts/index.css', './vendor/arco/css/arco.css', ...baseCss, ...(p.css || [])])
  const extraScriptTags = [
    ...(p.charts ? chartScripts : []),
    ...(p.avatarCrop ? avatarCropScripts : []),
  ]
  const metaScript = p.meta
    ? `  <script>window.ArcoProPageMeta = ${JSON.stringify(p.meta)};</script>\n`
    : ''
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.title} - ${APP_TITLE}</title>
  <link rel="shortcut icon" type="image/x-icon" href="images/logo.svg" />
${cssLinks}
</head>
<body>
  <div id="app"></div>
${scriptTags(shellScripts)}
${extraScriptTags.length ? `${scriptTags(extraScriptTags)}\n` : ''}${metaScript}  <script src="${p.js}"></script>
</body>
</html>
`
  writeFile(p.file, html)
}

function writeLoginPage(p) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>\u767b\u5f55 - ${APP_TITLE}</title>
  <link rel="shortcut icon" type="image/x-icon" href="images/logo.svg" />
${linkTags([
    './fonts/index.css',
    './vendor/arco/css/arco.css',
    `./vendor/fontawesome/css/all.min.css?v=${V.fa}`,
    `./vendor/fontawesome/css/sharp-light.css?v=${V.fa}`,
    `./css/fa-icons.css?v=${V.faIconsCss}`,
    `./css/arco-theme-pro.css?v=${V.arcoThemePro}`,
    ...p.css,
  ])}
</head>
<body>
  <div id="app"></div>
${scriptTags([...loginScripts, p.js])}
</body>
</html>
`
  writeFile(p.file, html)
}

function writeDashboardVariant(p) {
  const cssHrefs = [
    './fonts/index.css',
    './vendor/arco/css/arco.css',
    `./vendor/fontawesome/css/all.min.css?v=${V.fa}`,
    `./vendor/fontawesome/css/sharp-light.css?v=${V.fa}`,
    `./css/fa-icons.css?v=${V.faIconsCss}`,
    `./css/arco-theme-pro.css?v=${V.arcoThemePro}`,
    `./css/layout.css?v=${V.layout}`,
    './vendor/nprogress/nprogress.css',
    `./css/page-progress.css?v=${V.pageProgress}`,
    `./css/pages-common.css?v=${V.pagesCommon}`,
    ...p.css,
  ]
  if (p.charts) cssHrefs.push(`./css/shadcn-chart.css?v=${V.shadcnChartCssDash}`)

  const bodyScripts = [
    './vendor/vue/vue.global.prod.js',
    './vendor/arco/arco-vue.min.js',
    ...dashboardScriptsBody,
  ]
  if (p.charts) {
    bodyScripts.push('./vendor/unovis/unovis.min.js')
    bodyScripts.push(`./js/charts/shadcn-charts.js?v=${V.shadcnChartDash}`)
  }
  if (p.mocks) bodyScripts.push(...p.mocks)
  bodyScripts.push(p.js)

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${p.title} - ${APP_TITLE}</title>
  <link rel="shortcut icon" type="image/x-icon" href="images/logo.svg" />
${linkTags(cssHrefs)}
  <script src="./js/page-progress-early.js?v=${V.pageProgress}"></script>
</head>
<body>
  <div id="app"></div>
${scriptTags(bodyScripts)}
</body>
</html>
`
  writeFile(p.file, html)
}

{
  const themeSrc = fs.readFileSync(new URL('../js/arco-theme.js', import.meta.url), 'utf8')
  if (!themeSrc.includes('ensureChartPalette') || !themeSrc.includes('chart-palette.js')) {
    throw new Error('arco-theme.js must auto-inject chart-palette.js (ensureChartPalette)')
  }
}

for (const p of pages) writeShellPage(p)
for (const p of loginPages) writeLoginPage(p)
for (const p of dashboardVariants) writeDashboardVariant(p)
