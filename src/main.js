import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import routers from './routers'

import wfc from './wfc/client/wfc'
import VueTippy, {TippyComponent} from "vue-tippy";
import VueContext from 'vue-context';

import VModal from 'vue-js-modal'
import './global.css'
import './wfc.css'
import './assets/fonts/icomoon/style.css'
import store from "@/store";
import visibility from 'vue-visibility-change';
import {isElectron, remote} from "@/platform";
import {getItem} from "./ui/util/storageHelper";
import VueI18n from 'vue-i18n'
import Notifications from 'vue-notification'
import Alert from "./ui/common/Alert.js";

import audio from './assets/music/notice.mp3'

// 方法1：注册播放音频事件到Vue实例上
Vue.prototype.playAudio = () => {
    let buttonAudio = document.getElementById('eventAudio');
    buttonAudio.setAttribute('src',audio)
    buttonAudio.play()
}

Vue.config.productionTip = false

// init
{
    let href = window.location.href;
    let path = href.substring(href.indexOf('#') + 1)
    console.log('init', href, path)
    if (path === '/'/*login*/ || path === '/home' || href.indexOf('#') === -1) {
        console.log('init wfc')
        if (isElectron()) {
            let sharedObj = remote.getGlobal('sharedObj');
            wfc.init([sharedObj.proto])
        } else {
            wfc.init();
        }
        store.init(true);
    } else {
        console.log('not home window, not init wfc')
        if (isElectron()) {
            let sharedObj = remote.getGlobal('sharedObj');
            wfc.attach(sharedObj.proto)
        }
        store.init(false);
    }
}
// init end

Vue.use(VueRouter)

Vue.use(VueTippy);
Vue.component("tippy", TippyComponent);

Vue.use(VueContext);
Vue.component("vue-context", VueContext)

Vue.use(VModal);

Vue.use(visibility);

Vue.use(VueI18n)
Vue.use(Alert)

const i18n = new VueI18n({
    // 使用localStorage存储语言状态是为了保证页面刷新之后还是保持原来选择的语言状态
    locale: getItem('lang') ? getItem('lang') : 'zh-CN', // 定义默认语言为中文
    messages: {
        'zh-CN': require('@/assets/lang/zh-CN.json'),
        'zh-TW': require('@/assets/lang/zh-TW.json'),
        'en': require('@/assets/lang/en.json')
    }
})

Vue.use(Notifications)


const router = new VueRouter({
    mode: 'hash',
    routes: routers,
})

Vue.prototype.$eventBus = new Vue();

var vm = new Vue({
    el: '#app',
    router,
    i18n,
    render: h => h(App),
})
vm.store = store.state;

window.vm = vm;

