/**
 * 头像圆形裁切（原型）：选图 → 弹窗拖拽/缩放 → 确认输出
 * 页面通过 mixins: [ArcoProAvatarCrop.createMixin(locale)] 接入
 */
;(function () {
  const STAGE_SIZE = 420
  const MASK_INSET = 28
  const CIRCLE_SIZE = STAGE_SIZE - MASK_INSET * 2
  const OUTPUT_SIZE = 240

  function createMixin(locale) {
    const t = locale || {}
    return {
      data() {
        return {
          cropVisible: false,
          cropSourceUrl: '',
          cropZoom: 1,
          cropOffsetX: 0,
          cropOffsetY: 0,
          cropNaturalW: 0,
          cropNaturalH: 0,
          cropDragging: false,
          cropLastX: 0,
          cropLastY: 0,
          cropReady: false,
        }
      },
      computed: {
        cropCoverScale() {
          if (!this.cropNaturalW || !this.cropNaturalH) return 1
          return CIRCLE_SIZE / Math.min(this.cropNaturalW, this.cropNaturalH)
        },
        cropDisplayScale() {
          return this.cropCoverScale * this.cropZoom
        },
        cropImageStyle() {
          const w = this.cropNaturalW * this.cropDisplayScale
          const h = this.cropNaturalH * this.cropDisplayScale
          return {
            width: w + 'px',
            height: h + 'px',
            left: (STAGE_SIZE - w) / 2 + this.cropOffsetX + 'px',
            top: (STAGE_SIZE - h) / 2 + this.cropOffsetY + 'px',
          }
        },
      },
      watch: {
        cropZoom() {
          this.clampCropOffset()
        },
        cropVisible(visible) {
          if (visible) this.lockCropScrollCompensation()
          else this.unlockCropScrollCompensation()
        },
      },
      beforeUnmount() {
        this.unlockCropScrollCompensation()
        this.revokeCropSource()
        if (this.avatarObjectUrl) URL.revokeObjectURL(this.avatarObjectUrl)
      },
      methods: {
        lockCropScrollCompensation() {
          if (this._cropScrollCompLocked) return
          const api = window.ArcoProScrollbar
          const sbw = api && typeof api.refresh === 'function'
            ? api.refresh()
            : Math.max(0, window.innerWidth - document.documentElement.clientWidth)
          this._cropScrollCompSbw = sbw
          if (sbw > 0) {
            document.documentElement.style.setProperty('--pro-scrollbar-compensation', sbw + 'px')
          }
          document.documentElement.classList.add('is-scroll-locked')
          this._cropScrollCompLocked = true
        },
        unlockCropScrollCompensation() {
          if (!this._cropScrollCompLocked) return
          this._cropScrollCompLocked = false
          this._cropScrollCompSbw = 0
          // 等 Arco 解除 body 锁后再清；页面搜索打开时保留补偿
          this.$nextTick(() => {
            window.setTimeout(() => {
              if (document.documentElement.classList.contains('is-page-search-open')) return
              if (document.body && document.body.style.overflow === 'hidden') return
              document.documentElement.classList.remove('is-scroll-locked')
              document.documentElement.style.removeProperty('--pro-scrollbar-compensation')
            }, 0)
          })
        },
        revokeCropSource() {
          if (this.cropSourceUrl) {
            URL.revokeObjectURL(this.cropSourceUrl)
            this.cropSourceUrl = ''
          }
        },
        onAvatarClick() {
          const input = this.$refs.avatarInput
          if (input) input.click()
        },
        onAvatarChange(e) {
          const file = e.target && e.target.files && e.target.files[0]
          if (!file) return
          if (!/^image\//.test(file.type)) {
            ArcoVue.Message.warning(t.avatarInvalid || '请选择图片文件')
            e.target.value = ''
            return
          }
          if (file.size > 2 * 1024 * 1024) {
            ArcoVue.Message.warning(t.avatarTooLarge || '图片大小不能超过 2MB')
            e.target.value = ''
            return
          }
          this.revokeCropSource()
          this.cropSourceUrl = URL.createObjectURL(file)
          this.cropZoom = 1
          this.cropOffsetX = 0
          this.cropOffsetY = 0
          this.cropNaturalW = 0
          this.cropNaturalH = 0
          this.cropReady = false
          // 先量滚动条再开弹窗，避免锁滚动后宽度变为 0
          this.lockCropScrollCompensation()
          this.cropVisible = true
          e.target.value = ''
        },
        onCropImageLoad(e) {
          const img = e.target
          this.cropNaturalW = img.naturalWidth
          this.cropNaturalH = img.naturalHeight
          this.cropZoom = 1
          this.cropOffsetX = 0
          this.cropOffsetY = 0
          this.cropReady = true
          this.clampCropOffset()
        },
        clampCropOffset() {
          if (!this.cropNaturalW || !this.cropNaturalH) return
          const w = this.cropNaturalW * this.cropDisplayScale
          const h = this.cropNaturalH * this.cropDisplayScale
          const maxX = Math.max(0, (w - CIRCLE_SIZE) / 2)
          const maxY = Math.max(0, (h - CIRCLE_SIZE) / 2)
          this.cropOffsetX = Math.min(maxX, Math.max(-maxX, this.cropOffsetX))
          this.cropOffsetY = Math.min(maxY, Math.max(-maxY, this.cropOffsetY))
        },
        onCropPointerDown(e) {
          if (!this.cropReady) return
          this.cropDragging = true
          this.cropLastX = e.clientX
          this.cropLastY = e.clientY
        },
        onCropPointerMove(e) {
          if (!this.cropDragging) return
          const dx = e.clientX - this.cropLastX
          const dy = e.clientY - this.cropLastY
          this.cropLastX = e.clientX
          this.cropLastY = e.clientY
          this.cropOffsetX += dx
          this.cropOffsetY += dy
          this.clampCropOffset()
        },
        onCropPointerUp() {
          this.cropDragging = false
        },
        onCropWheel(e) {
          const next = Math.min(3, Math.max(1, this.cropZoom + (e.deltaY > 0 ? -0.08 : 0.08)))
          this.cropZoom = Number(next.toFixed(2))
        },
        onCropCancel() {
          this.cropVisible = false
          this.cropDragging = false
          this.revokeCropSource()
          this.cropReady = false
        },
        onCropReselect() {
          this.onAvatarClick()
        },
        onCropConfirm() {
          if (!this.cropReady || !this.cropNaturalW) {
            ArcoVue.Message.warning(t.cropNotReady || '请等待图片加载完成')
            return
          }
          const img = this.$refs.cropImage
          if (!img) return
          const scale = this.cropDisplayScale
          const w = this.cropNaturalW * scale
          const h = this.cropNaturalH * scale
          const left = (STAGE_SIZE - w) / 2 + this.cropOffsetX
          const top = (STAGE_SIZE - h) / 2 + this.cropOffsetY
          const sx = (MASK_INSET - left) / scale
          const sy = (MASK_INSET - top) / scale
          const sw = CIRCLE_SIZE / scale
          const sh = CIRCLE_SIZE / scale

          const canvas = document.createElement('canvas')
          canvas.width = OUTPUT_SIZE
          canvas.height = OUTPUT_SIZE
          const ctx = canvas.getContext('2d')
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                ArcoVue.Message.error(t.cropFailed || '裁切失败，请重试')
                return
              }
              if (this.avatarObjectUrl) URL.revokeObjectURL(this.avatarObjectUrl)
              this.avatarObjectUrl = URL.createObjectURL(blob)
              this.avatarUrl = this.avatarObjectUrl
              this.cropVisible = false
              this.revokeCropSource()
              this.cropReady = false
              ArcoVue.Message.success(t.avatarSuccess || '头像已更新')
            },
            'image/png',
            0.92,
          )
        },
      },
    }
  }

  window.ArcoProAvatarCrop = {
    STAGE_SIZE,
    MASK_INSET,
    CIRCLE_SIZE,
    CROP_SIZE: STAGE_SIZE,
    OUTPUT_SIZE,
    createMixin,
  }
})()
