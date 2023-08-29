export default {
    async getCounters(ctx) {
		const counters = {
			total_jokes: 	await strapi.query('api::joke.joke').count({...ctx.query}),
			deleted_jokes: 	await strapi.query('api::joke.joke').count({status: 'deleted'}),
			comments: 		await strapi.query('plugin::comments.comment').count({...ctx.query}),
			users: 			await strapi.query('plugin::users-permissions.user').count({...ctx.query}),
			pending_jokes: 	await strapi.service('api::joke.joke').countPending(ctx),
			//members: await strapi. strapi.services.users.count({...ctx.query}),
			visits: 0,
		}
		return counters;
	},

	async getLatestComments(ctx) {
		let entities;
		ctx.query = {
			...ctx.query,
			_limit: 30,
			_sort: "id:DESC",		
			// TODO: add one for status later, to filter out blocked or not active comments
			};

		if (ctx.query._q) {
			entities = await strapi.query('comments').search(ctx.query);
		} else {
			entities = await strapi.query('comments').find(ctx.query,);
		}

		// remove deleted jokes and adult content
		// Get an array of promises based on your conditions
		const results = await Promise.all(entities.map(async element => {
			if (element.related[0].status === 'deleted') {
			return false;
			}
			
			const is_adult_joke = await strapi.service('api::globalcall.globalcall').isAdultJoke(element.related[0].id);
			return !is_adult_joke;
		}));
		
		// Filter the original array based on the resolved promises
		entities = entities.filter((_, index) => results[index]);
  
		//console.log(entities[0])
		return entities.slice(0,10);
	},
  
	async updateProfile(ctx){
		return;
	}
}