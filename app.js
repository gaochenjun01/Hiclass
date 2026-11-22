/* Hiclass 网站交互：功能演示、复制路径、入场动画 */
(function () {
  'use strict';

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  document.body.classList.add('animate');

  /* ---------------- 提示 ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2000);
  }

  /* ---------------- 入场动画 ---------------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- 导航 ---------------- */
  $('#navToggle').addEventListener('click', function () {
    document.body.classList.toggle('nav-open');
  });
  $$('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  });

  /* ---------------- 演示标签页 ---------------- */
  $$('.demo-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      $$('.demo-tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
      $$('.demo-panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + tab.dataset.panel); });
    });
  });

  /* ---------------- 学生积分演示 ---------------- */
  var seedStudents = [
    { id: 1, name: '陈小满', group: '第一组', points: 128, pet: 'corgi', color: '#2f6fde' },
    { id: 2, name: '林团团', group: '第二组', points: 96, pet: 'bunny', color: '#6d5ae8' },
    { id: 3, name: '王圆圆', group: '第三组', points: 88, pet: 'panda', color: '#12a87d' },
    { id: 4, name: '赵阿腾', group: '第一组', points: 71, pet: 'dragon', color: '#e8871e' },
    { id: 5, name: '周星星', group: '第二组', points: 64, pet: 'phoenix', color: '#e2455f' },
    { id: 6, name: '许可爱', group: '第三组', points: 52, pet: 'shiba', color: '#6d5ae8' }
  ];
  var students = JSON.parse(JSON.stringify(seedStudents));
  var activities = [
    { time: '10:42', text: '高老师给 陈小满 +3 分 · 课堂表现' },
    { time: '10:36', text: '第三组 全班加分 +1' },
    { time: '10:21', text: '林团团的宠物 团团 进化到 Lv.4' }
  ];
  var petNames = { corgi: '小满', bunny: '团团', panda: '圆圆', dragon: '阿腾', phoenix: '星星', shiba: '可爱' };

  function level(p) { return Math.max(1, Math.min(6, Math.floor(p / 30) + 1)); }

  function renderStudents() {
    var q = ($('#studentSearch').value || '').trim().toLowerCase();
    var list = students.filter(function (s) {
      return !q || s.name.toLowerCase().indexOf(q) >= 0 || s.group.toLowerCase().indexOf(q) >= 0;
    });
    $('#studentGrid').innerHTML = list.length ? list.map(function (s) {
      return '<div class="stu-card" data-id="' + s.id + '">' +
        '<div class="stu-top"><span class="stu-av" style="background:' + s.color + '">' + esc(s.name.slice(-2, -1)) + '</span>' +
        '<span class="stu-name">' + esc(s.name) + '</span><span class="stu-pts">' + s.points + '</span></div>' +
        '<div class="stu-meta"><span>' + esc(s.group) + '</span><img src="assets/pets/' + s.pet + '.webp" alt="" />' +
        '<span>' + esc(petNames[s.pet] || '宠物') + ' · Lv.' + level(s.points) + '</span></div>' +
        '<div class="stu-ops"><button class="add" data-delta="1">+1</button><button class="add" data-delta="3">+3</button>' +
        '<button class="minus" data-delta="-1">-1</button></div></div>';
    }).join('') : '<div class="aside-card">没有找到匹配的学生</div>';
    renderRank();
  }

  function renderRank() {
    var top = students.slice().sort(function (a, b) { return b.points - a.points; }).slice(0, 6);
    $('#rankList').innerHTML = top.map(function (s, i) {
      return '<li><span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(s.name) + '</span><span class="vl">' + s.points + '</span></li>';
    }).join('');
  }

  function timeNow() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function log(text) {
    activities.unshift({ time: timeNow(), text: text });
    activities = activities.slice(0, 12);
    $('#activityList').innerHTML = activities.map(function (a) {
      return '<div><time>' + a.time + '</time>' + esc(a.text) + '</div>';
    }).join('');
  }

  function valuePts() {
    var v = parseInt($('#ptsInput').value, 10);
    return isNaN(v) ? 1 : Math.max(1, Math.min(20, v));
  }

  function changePoints(id, delta, label) {
    var s = students.find(function (x) { return x.id === id; });
    if (!s) return;
    s.points = Math.max(0, s.points + delta);
    renderStudents();
    log('高老师给 ' + s.name + ' ' + (delta > 0 ? '+' : '') + delta + ' 分' + (label ? ' · ' + label : ''));
    toast(s.name + (delta > 0 ? ' +' : ' ') + delta + ' 分');
  }

  $('#studentGrid').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-delta]');
    if (!btn) return;
    var card = btn.closest('.stu-card');
    changePoints(Number(card.dataset.id), Number(btn.dataset.delta), '课堂表现');
  });

  $('#studentSearch').addEventListener('input', renderStudents);

  $('[data-action="all-up"]').addEventListener('click', function () {
    var n = valuePts();
    students.forEach(function (s) { s.points += n; });
    renderStudents();
    log('全班加分 +' + n);
    toast('全班已加 ' + n + ' 分');
  });

  $('[data-action="reset"]').addEventListener('click', function () {
    students = JSON.parse(JSON.stringify(seedStudents));
    activities = [
      { time: '10:42', text: '高老师给 陈小满 +3 分 · 课堂表现' },
      { time: '10:36', text: '第三组 全班加分 +1' },
      { time: '10:21', text: '林团团的宠物 团团 进化到 Lv.4' }
    ];
    $('#studentSearch').value = '';
    $('#ptsInput').value = 1;
    renderStudents();
    log('演示数据已重置');
    toast('已恢复初始数据');
  });

  renderStudents();
  log('进入班级 · 六年级一班');

  /* ---------------- 课堂工具 ---------------- */
  var picking = false;
  $('[data-action="pick"]').addEventListener('click', function () {
    if (picking) return;
    picking = true;
    var display = $('#pickerName');
    var i = 0;
    var timer = setInterval(function () {
      display.textContent = students[i % students.length].name;
      i++;
    }, 80);
    setTimeout(function () {
      clearInterval(timer);
      var picked = students[Math.floor(Math.random() * students.length)];
      display.textContent = picked.name;
      $('#pickHint').textContent = '恭喜 ' + picked.name + '！已自动 +' + valuePts() + ' 分';
      picked.points += valuePts();
      renderStudents();
      log('随机点名抽中 ' + picked.name + ' · +' + valuePts() + ' 分');
      toast('抽中 ' + picked.name);
      picking = false;
    }, 1300);
  });

  var timerTotal = 300;
  var timerLeft = 300;
  var timerId = null;
  function renderTimer() {
    var m = Math.floor(timerLeft / 60);
    var s = timerLeft % 60;
    $('#timerDisplay').textContent = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
  }
  $$('.timer-presets button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.timer-presets button').forEach(function (x) { x.classList.toggle('on', x === b); });
      timerTotal = timerLeft = Number(b.dataset.min) * 60;
      clearInterval(timerId);
      timerId = null;
      $('#timerToggle').textContent = '开始';
      renderTimer();
    });
  });
  $('[data-action="timer-toggle"]').addEventListener('click', function () {
    if (timerId) {
      clearInterval(timerId); timerId = null;
      $('#timerToggle').textContent = '继续';
      toast('计时已暂停');
      return;
    }
    if (timerLeft <= 0) timerLeft = timerTotal;
    $('#timerToggle').textContent = '暂停';
    timerId = setInterval(function () {
      timerLeft--;
      renderTimer();
      if (timerLeft <= 0) {
        clearInterval(timerId); timerId = null;
        $('#timerToggle').textContent = '开始';
        toast('时间到！');
      }
    }, 1000);
  });
  $('[data-action="timer-reset"]').addEventListener('click', function () {
    clearInterval(timerId); timerId = null;
    timerLeft = timerTotal;
    $('#timerToggle').textContent = '开始';
    renderTimer();
  });
  renderTimer();

  var groups = [
    { name: '第一组', points: 46 }, { name: '第二组', points: 38 }, { name: '第三组', points: 31 }
  ];
  function renderPK() {
    var max = Math.max.apply(null, groups.map(function (g) { return g.points; })) || 1;
    $('#pkList').innerHTML = groups.map(function (g, i) {
      return '<div><div class="pk-row"><span>' + esc(g.name) + '</span><div class="bar"><i style="width:' + Math.round(g.points / max * 100) + '%"></i></div><b>' + g.points + '</b></div>' +
        '<div class="pk-ops"><button data-g="' + i + '" data-d="1">+1</button><button data-g="' + i + '" data-d="3">+3</button><button data-g="' + i + '" data-d="-1">-1</button></div></div>';
    }).join('');
  }
  $('#pkList').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-g]');
    if (!b) return;
    var g = groups[Number(b.dataset.g)];
    g.points = Math.max(0, g.points + Number(b.dataset.d));
    renderPK();
    log(g.name + ' ' + (Number(b.dataset.d) > 0 ? '+' : '') + b.dataset.d + ' 分 · 小组 PK');
  });
  renderPK();

  /* ---------------- 作业班务 ---------------- */
  var homework = [
    { title: '语文：第 28 页生字抄写', date: '11 月 21 日', status: 'done', classes: '第一组 · 42 人' },
    { title: '数学：第三单元练习卷', date: '11 月 20 日', status: 'great', classes: '全班 · 45 人' },
    { title: '英语：听读打卡第 6 天', date: '11 月 19 日', status: 'late', classes: '第二组 · 15 人' },
    { title: '科学：观察记录表', date: '11 月 18 日', status: 'missing', classes: '第三组 · 14 人' }
  ];
  var statusList = [
    { k: 'done', t: '已完成' }, { k: 'great', t: '优秀' }, { k: 'late', t: '待补交' }, { k: 'missing', t: '未完成' }
  ];
  function renderHW() {
    $('#hwList').innerHTML = homework.map(function (h, i) {
      var st = statusList.filter(function (x) { return x.k === h.status; })[0] || statusList[0];
      return '<div class="hw-item"><div class="hw-top"><b>' + esc(h.title) + '</b><small>' + esc(h.date) + '</small>' +
        '<button class="hw-status ' + h.status + '" data-hw="' + i + '">' + st.t + '</button></div>' +
        '<div class="hw-chips"><span>' + esc(h.classes) + '</span><span>点击状态切换</span></div></div>';
    }).join('');
  }
  $('#hwList').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-hw]');
    if (!b) return;
    var h = homework[Number(b.dataset.hw)];
    var idx = statusList.findIndex(function (x) { return x.k === h.status; });
    h.status = statusList[(idx + 1) % statusList.length].k;
    renderHW();
    toast('状态已更新');
  });
  renderHW();

  var dutyNames = ['陈小满', '林团团', '王圆圆', '赵阿腾', '周星星', '许可爱', '陈小满', '林团团', '王圆圆', '赵阿腾'];
  $('#dutyGrid').innerHTML = dutyNames.map(function (n, i) {
    return '<div class="' + (i % 3 === 0 ? 'on' : '') + '">' + esc(n) + '</div>';
  }).join('');

  /* ---------------- 家校沟通 ---------------- */
  var presets = ['请坐端正', '翻开课本', '保持安静', '准备下课'];
  $('#presetRow').innerHTML = presets.map(function (p) { return '<button type="button">' + esc(p) + '</button>'; }).join('');
  $('#presetRow').addEventListener('click', function (e) {
    if (e.target.tagName !== 'BUTTON') return;
    $('#talkText').value = e.target.textContent;
  });

  function renderTalkLog(items) {
    $('#talkLog').innerHTML = items.map(function (t) {
      return '<div class="log-line"><time>' + t.time + '</time><span>' + esc(t.text) + '</span></div>';
    }).join('');
  }
  var talks = [{ time: '10:15', text: '同学们准备好上课啦。' }];
  renderTalkLog(talks);
  $('[data-action="talk"]').addEventListener('click', function () {
    var text = ($('#talkText').value || '').trim();
    if (!text) { toast('先写点要喊的话吧'); return; }
    talks.unshift({ time: timeNow(), text: text });
    renderTalkLog(talks);
    toast('已喊话到教室电脑');
  });

  /* ---------------- 复制安装包路径 ---------------- */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      function done() { toast('已复制本地安装包路径'); }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动复制'); }
        document.body.removeChild(ta);
      }
    });
  });
})();
