const KeysMap = {
  '-1,2,-94,-100,': 'user_agent',
  '-1,2,-94,-101,': 'sensor_status',
  '-1,2,-94,-105,': 'inform_info_pre', //空
  '-1,2,-94,-102,': 'inform_info', //登录有form就有数据
  '-1,2,-94,-108,': 'keyboard_action',
  '-1,2,-94,-110,': 'mouse_action',
  '-1,2,-94,-117,': 'touch_action',
  '-1,2,-94,-111,': 'device_orientation',
  '-1,2,-94,-109,': 'device_motion',
  '-1,2,-94,-114,': 'pointer_action',
  '-1,2,-94,-103,': 'display_change',
  '-1,2,-94,-112,': 'current_url',
  '-1,2,-94,-115,': 'cookies',
  '-1,2,-94,-106,': 'aj_counter',
  '-1,2,-94,-119,': 'performance',
  '-1,2,-94,-122,': 'env_config',
  '-1,2,-94,-123,': 'mn_r_1',
  '-1,2,-94,-124,': 'mn_r_2',
  '-1,2,-94,-70,': 'fp_val',
  '-1,2,-94,-80,': 'fp_val_enc',
  '-1,2,-94,-116,': 'start_time',
  '-1,2,-94,-118,': 'sensor_env',
  '-1,2,-94,-121,': 'footer', //最后是一些时间参数
  // '-1,2,-94,-120,': '',
};

class WebTool {
  static get_cf_date() {
    return Date['now'] ? Date['now']() : +new Date();
  }
}

export class WebAkamai {
  /**
   * 拆分数据
   * @param str
   */
  static splitStr(str) {
    for (let keysMapKey in KeysMap) {
      const reg = new RegExp(`${keysMapKey}`, 'g');
      str = str.replace(reg, `$FUCK${keysMapKey}$FUCK`);
    }
    const list = str.split('$FUCK');
    //进行数据对应
    const map: any = {
      header: list[0],
      user_agent: '',
      cookies: '',
      aj_counter: '',
      fp_val: '',
    };
    list.forEach((val, it) => {
      if (!KeysMap[val]) {
        return;
      }
      const key = KeysMap[val];
      let valStr = list[it + 1];
      map[key] = valStr;
    });

    //开始解析bmak
    const bmak = {
      ver: '1.43',
      sensor_status: map.sensor_status, //静态不变数据
      current_url: map.current_url,
      env_config: map.env_config,
      inform_info_pre: map.inform_info_pre,
      inform_info: map.inform_info,
      mn_r_1: '',
      mn_r_2: '',
      performance: map.performance,
      start_time: map.start_time,
      ...WebAkamai.parseUserAgentForBmak(map.user_agent),
      ...WebAkamai.parseAjCounter(map.aj_counter),
      ...WebAkamai.parseFpBmak(map.fp_val),
      ...WebAkamai.parseO9AndD3Bmak(map),
      ...WebAkamai.parseKeyboardEventsForBmak(map),
      ...WebAkamai.parseMouseEventsForBmak(map),
      ...WebAkamai.parseTouchEventsForBmak(map),
      ...WebAkamai.parseDmtionForBmak(map),
      ...WebAkamai.parseDOrienForBmak(map),
      ...WebAkamai.parsePointerForBmak(map),
      ...WebAkamai.parseDChangeForBmak(map),
      ...WebAkamai.parseFooterForBmak(map),
      ...WebAkamai.parseCookiesBmak(map.cookies),
    };
    map.tst = bmak.tst;
    map.ver = bmak.ver;
    map.bmak = bmak;

    console.log(bmak);
    //fuck 出来，然后fuck回去
    return map;
  }

  /**
   * 打包数据
   * @param obj
   */
  static packObj(obj) {
    let sensor_data = '1.43';
    //let sensor_data = obj.header;
    sensor_data += '-1,2,-94,-100,' + obj.user_agent;
    sensor_data += '-1,2,-94,-101,' + obj.sensor_status;
    sensor_data += '-1,2,-94,-105,' + obj.inform_info_pre;
    sensor_data += '-1,2,-94,-102,' + obj.inform_info; //登录有form就有数据
    sensor_data += '-1,2,-94,-108,' + obj.keyboard_action;
    sensor_data += '-1,2,-94,-110,' + obj.mouse_action;
    sensor_data += '-1,2,-94,-117,' + obj.touch_action;
    sensor_data += '-1,2,-94,-111,' + obj.device_orientation;
    sensor_data += '-1,2,-94,-109,' + obj.device_motion;
    sensor_data += '-1,2,-94,-114,' + obj.pointer_action;
    sensor_data += '-1,2,-94,-103,' + obj.display_change;
    sensor_data += '-1,2,-94,-112,' + obj.current_url;
    sensor_data += '-1,2,-94,-115,' + obj.cookies;
    sensor_data += '-1,2,-94,-106,' + obj.aj_counter;
    sensor_data += '-1,2,-94,-119,' + obj.performance;
    sensor_data += '-1,2,-94,-122,' + obj.env_config;
    sensor_data += '-1,2,-94,-123,' + obj.mn_r_1;
    sensor_data += '-1,2,-94,-124,' + obj.mn_r_2;

    const w = WebAkamai.ab(sensor_data);

    sensor_data += '-1,2,-94,-70,' + obj.fp_val;
    sensor_data += '-1,2,-94,-80,' + WebAkamai.ab(obj.fp_val);
    sensor_data += '-1,2,-94,-116,' + obj.start_time;
    sensor_data += '-1,2,-94,-118,' + w;
    //生成footer数据

    const end = WebAkamai.getHeaderAndFooter(obj);
    sensor_data += '-1,2,-94,-121,' + end.footer; //最后是一些时间参
    sensor_data = end.header.replace(obj.ver, '') + sensor_data;
    //还是需要动态生成
    // sensor_data = WebAkamai.endCheck(sensor_data);
    return sensor_data;
  }

  formInfos = {
    login: '0,2,1,0,2359,1878,0;1,2,1,0,2472,883,0;',
    register: '0,2,0,0,2396,-1,0;0,0,0,0,2381,-1,0;',
  };
  static cs = '0a46G5m17Vrp4o4c';
  static api_public_key = 'afSbep8yjnZUjq3aL010jO15Sawj2VZfdYK8uY90uxq';

  //默认选项
  bmak = {
    ver: '1.43',
    aj_type: 0,//比较重要
    aj_index: 0, //ajax计数器
    sensor_status: 'do_en,dm_en,t_en', //静态不变数据
    current_url: 'https://s3.nikecdn.com/unite/mobile.html',
    env_config: '0,0,0,0,1,0,0', //又是一波检测环境
    inform_info_pre: '',
    inform_info: '',
    mn_r_1: '',
    mn_r_2: '',
    performance: '28,32,31,12,18,18,13,6,6,5,5,5,9,263,',
    start_time: '5210694',

    start_ts: WebAkamai.get_cf_date(),
    init_time: 0,
    tst: 5, //初始化消耗的时间，一般是6-10之间

    //最终会被cookie传递
    canvasFp1: '-1', //配置指纹
    canvasFp2: '-1',
    fp2Val: '-1',

    runFonts: 'dis', //默认dis就可以了，如果bmak['altFonts']==true，那就有数据

    sessionStorageKey: true,
    localStorageKey: true,
    indexDbKey: true,
    webrtcKey: true,
    timezoneOffsetKey: new Date().getTimezoneOffset(),

    fpcf: {
      td: 6,//获取一些信息消耗的时间，直接写死就可以了
    },
    //2.x
    colorDepth: 24,
    pixelDepth: 24,
    cookieEnabled: true,
    javaEnabled: false,
    doNotTrack: -1,
    cookies: {},
    y1: 2016,
    //1343240651 779
    //user-agent,get_browser
    xagg: '11059',
    psub: '20030107',
    lang: 'zh-CN',
    prod: 'Gecko',

    pluginInfo: '', //默认空，一般都空，
    plen: 0, //plugins.length
    pen: 0, //_phantom
    wen: 0, //webdriver
    den: 0, //domAutomation
    z1: 0, //需要计算

    availWidth: -1,
    availHeight: -1,
    screenWidth: -1,
    screenHeight: -1,
    clientWidth: -1,
    clientHeight: -1,
    outerWidth: -1,
    o9: '-1',
    d3: '-1',
    ...WebAkamai.getO9AndD3(),

    //cookies
    n_ck: 0, //是否是新的ck
    d2: 0,

    //events
    mouse_action: {
      mact: '0,1,682,905,381;1,1,688,893,389;2,1,695,885,394;3,1,705,870,402;4,1,711,860,408;5,1,719,850,415;6,1,727,838,420;7,1,737,825,427;8,1,743,815,433;9,1,754,807,438;10,1,759,797,441;11,1,770,787,446;12,1,776,778,448;13,1,784,769,451;14,1,791,761,453;15,1,799,752,456;16,1,807,743,456;17,1,815,735,459;18,1,823,727,461;19,1,831,717,463;20,1,839,705,464;21,1,847,695,465;22,1,855,682,467;23,1,865,674,467;24,1,871,660,468;25,1,879,648,469;26,1,887,637,470;27,1,895,622,474;28,1,903,608,476;29,1,911,596,476;30,1,919,583,476;31,1,927,571,476;32,1,935,559,476;33,1,946,547,476;34,1,951,538,476;35,1,959,526,476;36,1,967,517,476;37,1,975,510,476;38,1,983,502,476;39,1,991,495,473;40,1,1001,486,471;41,1,1007,479,468;42,1,1018,473,465;43,1,1023,468,462;44,1,1031,461,458;45,1,1040,454,453;46,1,1050,449,448;47,1,1055,444,440;48,1,1064,439,432;49,1,1071,436,425;50,1,1079,432,414;51,1,1087,426,400;52,1,1095,425,389;53,1,1103,422,373;54,1,1111,419,360;55,1,1119,416,343;56,1,1129,415,328;57,1,1135,412,315;58,1,1143,411,300;59,1,1153,409,288;60,1,1160,408,276;61,1,1167,406,265;62,1,1175,405,253;63,1,1183,403,244;64,1,1191,402,237;65,1,1199,402,227;66,1,1207,402,219;67,1,1215,402,213;68,1,1223,402,206;69,1,1231,402,198;70,1,1239,402,190;71,1,1247,402,180;72,1,1255,403,172;73,1,1264,405,164;74,1,1271,408,155;75,1,1279,412,146;76,1,1290,415,139;77,1,1296,418,130;78,1,1303,423,122;79,1,1311,428,114;80,1,1320,432,107;81,1,1327,436,100;82,1,1335,440,95;83,1,1343,446,89;84,1,1351,450,85;85,1,1359,457,79;86,1,1367,461,75;87,1,1377,468,70;88,1,1383,476,66;89,1,1392,482,62;90,1,1399,490,58;91,1,1407,499,52;92,1,1415,506,49;93,1,1423,513,46;94,1,1431,521,43;95,1,1439,528,42;96,1,1447,534,40;97,1,1457,541,37;98,1,1463,544,37;99,1,1471,547,37;669,3,6420,479,161,1878;670,4,6504,479,161,1878;671,2,6504,479,161,1878;694,3,7512,444,194,883;695,4,7608,444,194,883;696,2,7608,444,194,883;735,3,11156,607,819,-1;',
      me_cnt: 107,
      me_vel: 261951,
      ta: 121,
    },
    pointer_action: {
      pact: '',
      pe_cnt: 0,
      pe_vel: 0,
      ta: 0,
    },
    display_change: {
      vc_cnt: 3,
      vcact: '3,6417;2,10441;3,11152;',
    },
    device_orientation: {
      doact: '0,29,-1,-1,-1;',
      doe_cnt: 1,
      doe_vel: 29,
      ta: 29,
    },
    device_motion: {
      dmact: '0,29,-1,-1,-1,-1,-1,-1,-1,-1,-1;',
      dme_cnt: 1,
      dme_vel: 29,
      ta: 29,
    },
    keyboard_action: {
      kact: '0,1,112478,-2,0,0,883;1,3,112478,-2,0,0,883;2,2,11…83;11,2,113525,-2,0,0,883;12,1,113679,-2,0,0,883;',
      ke_cnt: 13,
      ke_vel: 1468892,
      ta: 25,
    },
    touch_action: {
      ta: 0,
      tact: '',
      te_cnt: 0,
      te_vel: 0,
    },
    vel_total: 0,
    ta: 0,
  };

  /**
   *  console: bmak.fpcf['fpValstr']
   */
  static getFpVal(bmak) {
    bmak.fpcf.td = 6;//随机5-9
    const list = [
      bmak.canvasFp1,
      bmak.runFonts,
      bmak.pluginInfo,
      bmak.sessionStorageKey,
      bmak.localStorageKey,
      bmak.indexDbKey,
      bmak.timezoneOffsetKey,
      bmak.webrtcKey,
      bmak.colorDepth,
      bmak.pixelDepth,
      bmak.cookieEnabled,
      bmak.javaEnabled,
      bmak.doNotTrack,
    ];
    if (bmak.canvasFp1 === '-1') {
      return '-1';
    }
    return list.join(';').replace(/\"/g, '"\\""');
  }


  /**
   * 生成指纹的数据
   * @param cv1
   * @param cv2
   */
  static getCanvasFp(cv1, cv2) {
    const fp1 = this.calCanvasFpBase64(cv1);
    const fp2 = this.calCanvasFpBase64(cv2);
  }

  static calCanvasFpBase64(o) {
    let a = 0;
    for (let m = 0; m < o.length; m++) {
      a = (a << 5) - a + o.charCodeAt(m);
      a &= a;
    }
    return a.toString();
  }


  constants = {
    login_url: 'https://www.nike.com/cn/launch/?s=upcoming', //d url
    //https://s3.nikecdn.com/unite/mobile.html?mid=34007165970391021072899704546248003753&androidSDKVersion=2.8.1&uxid=com.nike.commerce.snkrs.droid&locale=zh_CN&backendEnvironment=identity&view=login&clientId=qG9fJbnMcBPAMGibPRGI72Zr89l8CD4R#%7B%22event%22:%22gigyaKey%22,%22apiKey%22:%22gigyaKeyNotSupported%22,%22ts%22:1571869804009%7D
    s3_login_url: 'https://s3.nikecdn.com/unite/mobile.html', //web端url
  };


  //打包数据
  static getMouseEventsFromBmak(bmak) {

  }

  //
  static getKeyboardActionFromBmak(bmak) {
    return '';
  }

  //#region 开始解析
  //解析鼠标数据
  static parseMouseEventsForBmak(map) {
    let ta = 0;
    let me_vel = 0;
    let me_cnt = 0;
    map.mouse_action.split(';').forEach((str) => {
      if (str === '') return;
      const arr = str.split(',');
      ta += parseInt(arr[2]);
      me_vel += (parseInt(arr[0]) + parseInt(arr[1]) + parseInt(arr[2]) + parseInt(arr[3]) + parseInt(arr[4]));
      me_cnt++;
    });
    return {
      mouse_action: {
        mact: map.mouse_action,
        me_cnt: me_cnt,//计数器会累加
        me_vel: me_vel,
        ta: ta,
      },
    };
  }

  //解析指纹
  static parseFpBmak(str) {
    const list = str.split(';');
    const map = {
      canvasFp1: list[0],
      runFonts: list[1],
      pluginInfo: list[2],
      sessionStorageKey: list[3],
      localStorageKey: list[4],
      indexDbKey: list[5],
      timezoneOffsetKey: list[6],
      webrtcKey: list[7],
      colorDepth: list[8],
      pixelDepth: list[9],
      cookieEnabled: list[10],
      javaEnabled: list[11],
      doNotTrack: list[12],
    };
    return { fp_list: map, ...map };
  }

  //keyboard
  static parseKeyboardEventsForBmak(map) {
    let ta = 0;
    let ke_vel = 0;
    let ke_cnt = 0;
    map.keyboard_action.split(';').forEach((str) => {
      if (str === '') return;
      const arr = str.split(',');
      ta += parseInt(arr[1]);
      ke_vel += (parseInt(arr[0]) + parseInt(arr[1]) + parseInt(arr[2]) + parseInt(arr[3]) + parseInt(arr[4]) + parseInt(arr[5]));
      ke_cnt++;
    });
    return {
      keyboard_action: {
        kact: map.keyboard_action,
        ke_cnt: ke_cnt,//计数器会累加
        ke_vel: ke_vel,
        ta: ta,
      },
    };
  }

  //touch
  static parseTouchEventsForBmak(map) {
    let ta = 0;
    let te_vel = 0;
    let te_cnt = 0;
    map.touch_action.split(';').forEach((str) => {
      if (str === '') return;
      const arr = str.split(',');
      ta += parseInt(arr[1]);
      te_vel += (parseInt(arr[0]) + parseInt(arr[1]) + parseInt(arr[2]) + parseInt(arr[3]) + parseInt(arr[4]));
      te_cnt++;
    });
    return {
      touch_action: {
        tact: map.touch_action,
        te_cnt: te_cnt,//计数器会累加
        te_vel: te_vel,
        ta: ta,
      },
    };
  }

  //ok
  static parseDmtionForBmak(map) {
    let ta = 0;
    let dme_vel = 0;
    let dme_cnt = 0;
    map.device_motion.split(';').forEach((str) => {
      if (str === '') return;
      const arr = str.split(',');
      ta += parseInt(arr[1]);
      dme_vel = dme_vel + parseInt(arr[0]) + parseInt(arr[1]);
      dme_cnt++;
    });
    return {
      device_motion: {
        dmact: map.device_motion,
        dme_cnt: dme_cnt,
        dme_vel: dme_vel,
        ta: ta,
      },
    };
  }

  //pointer
  static parsePointerForBmak(map) {
    let ta = 0;
    let pe_vel = 0;
    let pe_cnt = 0;
    map.pointer_action.split(';').forEach((str) => {
      if (str === '') return;
      const arr = str.split(',');
      ta += parseInt(arr[1]);
      pe_vel += (parseInt(arr[0]) + parseInt(arr[1]) + parseInt(arr[2]) + parseInt(arr[3]) + parseInt(arr[4]));
      pe_cnt++;
    });
    return {
      pointer_action: {
        pact: map.pointer_action,
        pe_cnt: pe_cnt,//计数器会累加
        pe_vel: pe_vel,
        ta: ta,
      },
    };
  }

  //foces display change
  static parseDChangeForBmak(map) {
    let vc_cnt = 0;
    map.display_change.split(';').forEach((str) => {
      if (str === '') return;
      vc_cnt++;
    });
    return {
      display_change: {
        vcact: map.display_change,
        vc_cnt: vc_cnt,
      },
    };
  }

  //ok
  static parseDOrienForBmak(map) {
    let ta = 0;
    let doe_vel = 0;
    let doe_cnt = 0;
    map.device_orientation.split(';').forEach((str) => {
      if (str === '') return;
      const arr = str.split(',');
      ta += parseInt(arr[1]);
      doe_vel = doe_vel + parseInt(arr[1]) + parseInt(arr[0]);
      doe_cnt++;
    });
    return {
      device_orientation: {
        doact: map.device_orientation,
        doe_cnt: doe_cnt,
        doe_vel: doe_vel,
        ta: ta,
      },
    };
  }

  /**
   * 逆向解析
   */
  static parseUserAgentForBmak(str) {
    const uas = str.split(',uaend,');//拆分成2份
    const strs = uas[1].split(/,/g);
    const map = {
      uar: uas[0],
      xagg: strs[0],
      psub: strs[1],
      lang: strs[2],
      prod: strs[3],
      plen: strs[4],
      pen: strs[5],
      wen: strs[6],
      den: strs[7],
      z1: strs[8],
      d3: strs[9],
      //
      r1: strs[33],
      start_ts: strs[34] * 2,
    };
    return {
      ...map,
      user_agent: map,
    };
  }

  static parseCookiesBmak(str) {
    const list = str.split(',');
    const map = {
      ke_vel: list[0] - 1,
      me_vel: list[1] - 1,
      te_vel: list[2],
      doe_vel: list[3],
      dme_vel: list[4],
      pe_vel: list[5],

      vel_total: list[6],
      _t: list[7],//一个时间差
      init_time: list[8],
      start_ts: list[9],

      td: list[10],
      d2: list[11],

      ke_cnt: list[12],
      me_cnt: list[13],
      _pi_s: list[14],//bmak['pi'](bmak['d2'] / 6);
      pe_cnt: list[15],
      te_cnt: list[16],

      _time_l: list[17],

      ta: list[18],
      n_ck: list[19],
      cks: list[20],
      cks_enc: list[21],
      fp2Val: list[22],
      canvasFp2: list[23],
      fas: list[24],
      //初始化一部分事件值数据
      fpcf: {
        rVal: list[22],
        rCFP: list[23],
        td: list[10],
      },
      _abck: list[20],
    };
    return {
      ...map,
      cookies: map,
    };
  }

  static parseAjCounter(str) {
    const list = str.split(',');
    return { aj_type: list[0], aj_index: list[1] };
  }

  static parseO9AndD3Bmak(map) {
    return { o9: map.start_time };
  }

  //#endregion


  //#region 生成 bmak


  /**
   * 关联了d3
   * OK
   */
  static getUserAgentStr(bmak) {
    let uar = bmak.uar;
    bmak.z1 = parseInt(bmak.start_ts / (2016 * 2016) + '');
    const r1 = WebAkamai.randLNm();
    const list = [
      uar,
      'uaend',
      bmak.xagg,
      bmak.psub,
      bmak.lang,
      bmak.prod,
      bmak.plen,
      bmak.pen,
      bmak.wen,
      bmak.den,
      bmak.z1,
      bmak.d3,
      //屏幕数据
      375,
      667,
      375,
      667,
      375,
      667,
      375,
      '',
      //bmak.bd()
      'cpen:0',
      'i1:0',
      'dm:0',
      'cwen:0',
      'non:1',
      'opc:0',
      'fc:1',
      'sc:0',
      'wrc:1',
      'isc:0',
      'vib:1',
      'bat:0',
      'x11:0',
      'x12:1',
      WebAkamai.ab(uar),
      r1,
      bmak.start_ts / 2,
      'loc:',
    ];
    return list.join(',');
  }

  /**
   * 获取一些数据包，
   * 大部分都OK
   */
  static getCookiesStr(bmak) {
    const cks = bmak.cookies['_abck'] || bmak._abck || '';
    let t = Date.now() - bmak.start_ts + 1 - 4;//有时候计算指纹，时间消耗更多,如果是调试模式-6
    bmak.d2 = parseInt(bmak.z1 / 23 + '');
    let l = t + 1;//上面计算的时间,其实这里不需要其他的了

    const et = parseInt(bmak.keyboard_action.ke_vel)
      + parseInt(bmak.mouse_action.me_vel)
      + parseInt(bmak.device_orientation.doe_vel)
      + parseInt(bmak.device_motion.dme_vel)
      + parseInt(bmak.touch_action.te_vel)
      + parseInt(bmak.pointer_action.pe_vel);//事件总数

    bmak.pointer_action.pe_cnt = bmak.pe_cnt;
    const list = [
      bmak.keyboard_action.ke_vel + 1,
      bmak.mouse_action.me_vel + 1,
      bmak.touch_action.te_vel,
      bmak.device_orientation.doe_vel,
      bmak.device_motion.dme_vel,
      bmak.pointer_action.pe_vel,
      et, //前6个之
      t, //启动时间差,开始时间-当前时间
      bmak.init_time, //基本上是:0
      bmak.start_ts, //init_time
      parseInt(Math.random() * 5 + 3 + ''), //指纹的生产时间 td
      bmak.d2, // z1/23
      bmak.keyboard_action.ke_cnt, //ke_cnt
      bmak.mouse_action.me_cnt, //me_cnt
      parseInt(bmak.d2 / 6 + ''), //s 固定值
      bmak.pointer_action.pe_cnt, //pe_cnt
      bmak.touch_action.te_cnt, //te_cnt
      l, //事件
      bmak.ta, //ta 传感器之类的数据了 18 OK
      bmak.n_ck, //  是否是生产的CK 19
      cks, //e 20
      WebAkamai.ab(cks),//加密cookie值
      bmak.fpcf.rVal, //生产的随机数值
      bmak.fpcf.rCFP,//指纹
      30261693, //fas，应该不重要指示一些值 24
    ];
    return list.join(',');
  }

  //#endregion

  //初始化数据
  init() {

  }


  /**
   * 没问题
   * @param data
   */

  /**
   * 解析obj成sensor 对象数据 然后传递给静态方法
   * @param bmak
   * @returns {string|*}
   */
  static packBMakToObject(bmak) {
    return {
      tst: bmak.tst,
      ver: bmak.ver,
      bmak: bmak,
      user_agent: WebAkamai.getUserAgentStr(bmak),
      cookies: WebAkamai.getCookiesStr(bmak),
      aj_counter: WebAkamai.getAjCounter(bmak),
      sensor_status: bmak.sensor_status, //web
      inform_info_pre: bmak.inform_info_pre,
      inform_info: bmak.inform_info,
      keyboard_action: bmak.keyboard_action.kact,
      mouse_action: bmak.mouse_action.mact,
      touch_action: bmak.touch_action.tact,
      device_orientation: bmak.device_orientation.doact,
      device_motion: bmak.device_motion.dmact,
      pointer_action: bmak.pointer_action.pact,
      display_change: bmak.display_change.vcact,
      current_url: bmak.current_url,
      performance: bmak.performance,
      env_config: bmak.env_config, //又是一波检测环境
      mn_r_1: bmak.mn_r_1,
      mn_r_2: bmak.mn_r_2,
      fp_val: WebAkamai.getFpVal(bmak),
      start_time: bmak.start_time, //这个值是o9值
      ...WebAkamai.getHeaderAndFooter(bmak),
    };
  }

  static randLNm() {
    const d = Math.random();
    const k = parseInt((1e3 * d) / 2 + '');
    let l = d + '';
    l = l['slice'](0, 11) + k;
    return l;
  }


  /**
   * 初始化的时候就需要写入了，这个应该是一个数据验证
   */
  static getO9AndD3() {
    let a = this.get_cf_date() % 1e7; //当前时间%7的余数
    const d3 = a;
    let t = a;
    for (let e = 0; e < 5; e++) {
      const n = parseInt(a / Math.pow(10, e) + '') % 10,
        o = n + 1;
      const m = 'return a' + this.getOptFromCode(n) + o + ';';
      t = new Function('a', m)(t);
    }
    return { o9: t, d3: d3 };
  }


  /**
   * 做校验,返回2个数据，一个是header，一个是footer
   * @param bmak
   */
  static getHeaderAndFooter(bmak) {
    const uptime = WebAkamai.get_cf_date() - 2;
    const j = WebAkamai.get_cf_date();
    const C = Math.floor(WebAkamai.get_cf_date() / 3600000); //一个小时内不会变化的参数值
    const head = WebAkamai.od(WebAkamai.cs, WebAkamai.api_public_key).slice(0, 16);
    const E = head + WebAkamai.od(C, head);
    let footer = ';' + (WebAkamai.get_cf_date() - uptime) + ';' + bmak.tst + ';' + (WebAkamai.get_cf_date() - j);
    return {
      header: E,
      footer: footer,
    };
  }

  static parseFooterForBmak(map) {
    const arr = map.footer.split(';');
    return { tst: arr[2] };
  }

  getCookie() {
    if (!this.bmak.cookies['_abck']) {
      this.bmak['n_ck'] = 1;
      this.bmak.cookies['_abck'] = 'fucker';
    }
  }

  setCookies(cookies) {
    this.bmak.cookies = { ...cookies, ...this.bmak.cookies };
  }


  static getAjCounter(bmak) {
    return `${bmak.aj_type},${bmak.aj_index}`;
  }

  static get_cf_date() {
    return Date.now ? Date.now() : +new Date();
  }


  /**
   * 生成AB代码
   * @param str
   */
  static ab(str) {
    if (null == str) {
      return -1;
    }
    try {
      let t = 0;
      for (let e = 0; e < str.length; e++) {
        const n = str.charCodeAt(e);
        n < 128 && (t += n);
      }
      return t;
    } catch (a) {
      return -2;
    }
  }

  static od(a, t) {
    try {
      a = String(a);
      t = String(t);
      const e = [];
      let n = t.length;
      if (n > 0) {
        for (let o = 0; o < a.length; o++) {
          let m = a['charCodeAt'](o),
            r = a['charAt'](o),
            i = t['charCodeAt'](o % n);
          (m = WebAkamai.rir(m, 47, 57, i)),
          m != a['charCodeAt'](o) && (r = String['fromCharCode'](m)),
            e['push'](r);
        }
        if (e['length'] > 0) return e['join']('');
      }
    } catch (a) {
    }
    return a;
  }


  /**
   * 4种计算符号
   * @param a
   */
  static getOptFromCode(a) {
    let t = a % 4;
    2 == t && (t = 3);
    const e = 42 + t;
    return String['fromCharCode'](e);
  }

  static rir(a, t, e, n) {
    return a > t && a <= e && (a += n % (e - t)) > e && (a = a - e + t), a;
  }

  create() {
    const bmak = this.bmak;
    const sensors = [];
    //3.提交一些事件,点击
    bmak.aj_type = 1;
    bmak.aj_index = 4;

    //计算指纹信息
    this.bmak.fp2Val = '778';
    this.bmak.canvasFp1 = '-739578230';
    this.bmak.canvasFp2 = '-1997306345';
    this.bmak = {
      sensor_status: 'do_en,dm_en,t_en', //静态不变数据
      current_url: 'https://s3.nikecdn.com/unite/mobile.html',
      env_config: '0,0,0,0,1,0,0', //又是一波检测环境
      inform_info_pre: '',
      inform_info: '',
      mn_r_1: '',
      mn_r_2: '',
      performance: '28,32,31,12,18,18,13,6,6,5,5,5,9,263,',
      start_time: '5210694',
      ...this.bmak,
    };
    sensors.push(this.bmak);
    return sensors.map(ss => {
      const obj = WebAkamai.packBMakToObject(ss);
      return WebAkamai.packObj(obj);
    });
  }
}
