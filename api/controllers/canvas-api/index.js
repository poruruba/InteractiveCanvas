'use strict';

const { URL, URLSearchParams } = require('url');
const fetch = require('node-fetch');

const base_url_html = 'https://【WebページサーバのURL】:20443';
const base_url_search = 'https://【検索サーバのURL】:20443';

const {
	conversation,
	Canvas, Card, Image, Suggestion
} = require('@assistant/conversation')

const app = conversation({ debug: true });

app.handle('start', conv => {
	console.log(conv);
	conv.add('これはインタラクティブキャンバスです。');

	if (conv.device.capabilities.includes("INTERACTIVE_CANVAS") ){
		conv.add(new Canvas({
			url: base_url_html + '/canvas_web',
			enableFullScreen: true
		}));
	}else
	if (conv.device.capabilities.includes("RICH_RESPONSE")) {
		conv.add('〇〇を探して、と言ってください。');
	}else{
		conv.scene.next.name = 'actions.scene.END_CONVERSATION';
		conv.add('この端末はディスプレイがないため対応していません。');
	}
});

app.handle('search', async conv => {
	console.log(conv);
	var keyword = conv.intent.params.search.resolved;
	conv.add(keyword + 'の画像が検索されました。');
	var json = await do_get(base_url_search + '/search-image-list', { keyword: keyword });
	console.log(json);
	if (conv.device.capabilities.includes("INTERACTIVE_CANVAS")) {
		conv.add(new Canvas({
			data: {
				which: 'search',
				items: json.items,
				keyword: keyword
			},
		}));
	}else
	if (conv.device.capabilities.includes("RICH_RESPONSE") ){
		conv.session.params.items = json.items;
		conv.session.params.keyword = keyword;
		conv.session.params.index = 0;
		constructRichReponse(conv);
	}
});

app.handle('next', async conv => {
	console.log(conv);
	conv.add('次の画像が選択されました。');
	if (conv.device.capabilities.includes("INTERACTIVE_CANVAS")) {
		conv.add(new Canvas({
			data: {
				which: 'next',
			},
		}));
	}else
	if (conv.device.capabilities.includes("RICH_RESPONSE")) {
		conv.session.params.index++;
		if (conv.session.params.index >= conv.session.params.items.length )
			conv.session.params.index = 0;
		constructRichReponse(conv);
	}
});

app.handle('previous', async conv => {
	console.log(conv);
	conv.add('前の画像が選択されました。');
	if (conv.device.capabilities.includes("INTERACTIVE_CANVAS")) {
		conv.add(new Canvas({
			data: {
				which: 'previous',
			},
		}));
	} else
	if (conv.device.capabilities.includes("RICH_RESPONSE")) {
		conv.session.params.index--;
		if (conv.session.params.index < 0 )
			conv.session.params.index = conv.session.params.items.length - 1;
		constructRichReponse(conv);
	}
});

app.handle('no_match', async conv => {
	console.log(conv);
	conv.add('もう一度言ってください。');
});

exports.fulfillment = app;

function constructRichReponse(conv) {
	conv.add(new Card({
		image: new Image({
			url: conv.session.params.items[conv.session.params.index].link
		})
	}));
	conv.add(new Suggestion({ title: "前の画像" }));
	conv.add(new Suggestion({ title: "次の画像" }));
}

function do_get(url, qs) {
	const params = new URLSearchParams(qs);

	return fetch(url + `?` + params.toString(), {
		method: 'GET',
	})
		.then((response) => {
			if (!response.ok)
				throw 'status is not 200';
			return response.json();
			//    return response.text();
			//    return response.blob();
			//    return response.arrayBuffer();
		});
}