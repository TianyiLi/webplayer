; (function () {
  'use strict';
  const config = {
    ip: 'smock.transtep.com',
  }
  const worker = new Worker('./worker.js')

  worker.onmessage = (e => {
    if (e.data.func !== 'message') return 
    const data = JSON.parse(e.data.msg)
    handleEvent(data)
  })
  worker.postMessage({
    func: 'config',
    data: {
      ip: config.ip,
      register: [
        'sys/after_hint'
      ]
    }
  })

  function handleEvent({e, arg}) {
    if (e === 'sys/after_hint') {
      try {
        if (arg.act === 'wp_switch_video')
        videoApp.src = arg.video
        videoApp.stop()
        videoApp.play()
      } catch (error) {
      }
    }
  }
})();