; (function () {
  'use strict';
  const config = {
    ip: 'smock.transtep.com',
  }

  const query = new URLSearchParams(window.location.search);
  const video = document.createElement('video');
  const numpad = document.getElementById('numpad');
  const numberDisplay = document.getElementById('number-display');
  const confirm = document.getElementById('confirm');

  video.src = query.get('video');
  setTimeout(() => {
    video.classList.add('blur');
    numpad.classList.add('show');
  }, Number(query.get('timeout')) * 1000);
  video.preload = 'metadata';
  video.autoplay = true;

  function onClick(str) {
    let inputValue = numberDisplay.value;
    switch (str) {
      case 'clear':
        inputValue = '';
        break;
      case 'delete':
        inputValue = inputValue.slice(0, -1);
        break;
      default:
        inputValue += str;
        break;
    }
    numberDisplay.value = inputValue;

    var taiwanMobileRegex = /^09\d{8}$/;
    var taiwanTelephoneRegex = /^0\d{2,3}\d{3,4}\d{3,4}$/;
    var isValid = taiwanMobileRegex.test(inputValue) || taiwanTelephoneRegex.test(inputValue);

    if (isValid) {
      confirm.removeAttribute('disabled');
    } else {
      confirm.setAttribute('disabled', true);
    }
    console.log(isValid)
  }

  function onConfirm() {
    var taiwanMobileRegex = /^09\d{8}$/;
    var taiwanTelephoneRegex = /^0\d{2,3}-\d{3,4}-\d{3,4}$/;
    var inputValue = numberDisplay.value;
    var isValid = taiwanMobileRegex.test(inputValue) || taiwanTelephoneRegex.test(inputValue);

    if (!isValid) return;
    var worker = new Worker("./worker.js");
    worker.postMessage({
      func: "config",
      data: {
        ip: config.ip
      }
    });

    worker.onmessage = function() {
      worker.postMessage({
        func: 'send',
        data: {
          data: {
            e: 'freebie/input',
            arg: {
              tel: numberDisplay.value
            }
          }
        }
      })
      setTimeout(() => worker.terminate(), 500)
    }
  }

  confirm.onClick = onConfirm;

  [].forEach.call(document.querySelectorAll('.key'), function (ele) {
    const key = ele.getAttribute('data-key');
    if (key) {
      ele.addEventListener('click', onClick.bind(null, key));
      ele.addEventListener('touch', onClick.bind(null, key));
    }
  });
  document.body.appendChild(video);
})();