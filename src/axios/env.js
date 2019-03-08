/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 域名地址
 * routerMode: 路由模式
 * imgBaseUrl: 图片所在域名地址
 *
 */

let baseUrl = '';
let filesystemUrl = '';
let routerMode = 'hash';
let imgBaseUrl;

if (process.env.NODE_ENV == 'development') {
       //baseUrl = 'http://172.30.6.125:3000';//周琳
	//  baseUrl = 'http://172.30.6.124:3000';       // 林维健
  // baseUrl = 'http://192.168.123.1:3000';       // 喻志林
  // baseUrl = 'http://192.168.2.228:3000';       // 宋小旭
	// baseUrl = 'http://172.30.6.132:3000';//李勇
	baseUrl = 'http://127.0.0.1:3000';           // 本地

	filesystemUrl = 'http://172.30.144.32:8089';    //图片上传文件服务器地址

	// imgBaseUrl = 'http://aitest.phicomm.com:28050';


  // baseUrl = 'http://127.0.0.1:3000';           // 本地
  // baseUrl = 'http://172.30.144.30:3000';       // 开发环境
  // baseUrl = 'http://172.30.144.31:3000';       // 测试s环境

	// 开发接口配置
	// baseUrl = 'http://aidev.phicomm.com:28082';
	// imgBaseUrl = 'http://aidev.phicomm.com:28050';

} else {
	// 测试环境
	if (process.env.type === 'test') {
		baseUrl = 'http://172.30.144.31:3000';
		filesystemUrl = 'http://172.30.144.34:8089';
	// 正式环境
	} else {
		baseUrl = 'http://172.30.144.30:3000';
		filesystemUrl = 'http://172.30.144.34:8089';
	}
}

export {
	baseUrl,
	filesystemUrl,
	routerMode,
	imgBaseUrl,
}
