import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/doc/',
  title: "hhhhhtao",
  description: "个人文档",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' }
    ],

    sidebar: [
      {
        text: '目录',
        items: [
          { text: '指南', link: '/guide' },
          { text: 'git', link: '/git' },
          { text: 'spring-boot', link: '/spring-boot' },
          { text: 'mybatis-plus', link: '/mybatis-plus' },
          { text: 'nginx', link: '/nginx' },
          { text: 'linux-ubuntu', link: '/linux-ubuntu' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],

    search: {
      provider: 'local'
    }
  }
})
