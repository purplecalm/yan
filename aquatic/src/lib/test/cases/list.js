require(['../case.js'],function(Case){
	
	new Case({
		url: '/api/config1',
		timeout: 100,
		data: {status:1,data: {
			frequency: {
				value: '2',
				name: '2h'
			},
			hotels: [
				{
					title: '酒店1',
					id: 1
				},
				{
					title: '酒店2',
					id: 2
				}
			]
		}}
	});
	
	new Case({
		url: '/api/hotel',
		timeout: 100,
		data: {status:1,data: {
			city: {
				code: 'beijing',
				name: '北京'
			},
			
			rooms: [
				{
					platform: '携程',
					id: 1,
					title: '酒店1',
					rooms: [{
						id: 123,
						name: '房型1'
					},{
						id: 234,
						name: '房型2'
					},{
						id: 345,
						name: '房型3'
					}]
				},
				{
					platform: '去哪儿',
					title: '酒店1',
					id: 2,
					rooms: []
				}
			],
			
			enabled: true
		}}
	});
	
	
	new Case({
		url: '/api/hotel/rooms',
		timeout: 100,
		data: {status:1,data:[
			{
				id: 123,
				name: '房型1'
			},{
				id: 234,
				name: '房型2'
			},{
				id: 345,
				name: '房型3'
			},{
				id: 456,
				name: '房型4'
			},{
				id: 567,
				name: '房型5'
			}
		]}
	});
	
	
	new Case({
		url: '/api/news',
		timeout: 100,
		data: {status:1,data:[
			{
				time: 1501663131172,
				day: '2017-08-03',
				type: 'change',
				oldprice: 127,
				newprice: 103,
				extra: '无早 + 不可退',
				hotel: '酒店1',
				hotel_id: 1,
				room: '豪华大床房',
				room_id: 1,
				pid: 2,
				pname: '酒店1',
				platform: '携程',
				platform_id: 3,
				id: 123
			},
			
			{
				time: 1501663131172,
				day: '2017-08-04',
				type: 'change',
				oldprice: 103,
				newprice: 156,
				extra: '无早 + 不可退',
				hotel: '酒店1',
				hotel_id: 1,
				room: '豪华大床房',
				room_id: 1,
				pid: 2,
				pname: '酒店1',
				platform: '携程',
				platform_id: 3,
				id: 123
			},
			
			
			{
				time: 1501663131172,
				day: '2017-08-05',
				type: 'new',
				oldprice: 0,
				newprice: 105,
				extra: '无早 + 不可退',
				hotel: '酒店1',
				hotel_id: 1,
				room: '豪华大床房',
				room_id: 1,
				pid: 2,
				pname: '酒店1',
				platform: '携程',
				platform_id: 3,
				id: 234
			}
		]}
	});
});