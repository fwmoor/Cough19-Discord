const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require('axios').default;
const lookup = require('iso-countries-lookup');

// Customise
var name = 'Cough19';
var prefix = '$';
var color = "#FFFF00";
var thumb = "https://www.occrp.org/images/Corona.png";

// Axios options - API call options
var options = {
	method: 'GET',
	url: 'https://covid-193.p.rapidapi.com/statistics',
	headers: {
		'x-rapidapi-key': '<api-token>',
		'x-rapidapi-host': 'covid-193.p.rapidapi.com'
	}
};

function formatNumber(num) {
	return num.toLocaleString().replace(/,/g, ' ')
}

function getCountryList(page = 1, l) {
	let index = (page == 1) ? 0 : (page - 1) * 25 - 1;
	let c = l.splice(index, 25);
	return new Discord.MessageEmbed()
		.setColor(color)
		.setTitle("\:earth_americas: List Of Countries \:earth_americas: ")
		.setDescription(`${c[0]}\n${c[1]}\n${c[2]}\n${c[3]}\n${c[4]}\n${c[5]}\n${c[6]}\n${c[7]}\n${c[8]}\n${c[9]}\n${c[10]}\n${c[11]}\n${c[12]}\n${c[14]}\n${c[15]}\n${c[15]}\n${c[16]}\n${c[17]}\n${c[18]}\n${c[19]}\n${c[20]}\n${c[21]}\n${c[22]}\n${c[23]}\n${c[24]}`)
		.setThumbnail(thumb)
		.setFooter(`Page ${page} of ${Math.ceil(l.length / 25)}`)
}

function getHelpMessage() {
	return new Discord.MessageEmbed()
		.setColor(color)
		.setTitle("\:ghost: Help \:ghost:")
		.setDescription(`How To Use ${name}`)
		.setThumbnail(thumb)
		.addField("Top 5 Country (Total Cases)", "$leaderboard")
		.addField("Country Stats", "$country <country name>")
		.addField("List Of Countries", "$countries <page number>")
		.setFooter(`${name} - 2020`)
}

client.on("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
	if (msg.author.bot || msg.content[0] != prefix) return;
	let m = msg.content.toLowerCase().substring(1).split(' ');
	if (m[0] == 'leaderboard') { // Returns top 5 countries based on total cases
		options.url = 'https://covid-193.p.rapidapi.com/statistics';
		delete options.params;
		axios.request(options).then(function (response) {
			let c = response.data.response.filter(e => e.population);
			c.sort(function (a, b) {
				if (a.cases.total < b.cases.total) return 1;
				else if (a.cases.total == b.cases.total) return 0;
				else return -1;
			});
			msg.channel.send(new Discord.MessageEmbed()
				.setColor(color)
				.setTitle(`\:trophy: Leaderboard \:trophy:`)
				.setDescription("Total Confirmed Cases")
				.setThumbnail(thumb)
				.addField(`\:first_place:\t${c[0].country}`, formatNumber(c[0].cases.total))
				.addField(`\:second_place:\t${c[1].country}`, formatNumber(c[1].cases.total))
				.addField(`\:third_place:\t${c[2].country}`, formatNumber(c[2].cases.total))
				.addField(`\:medal:\t${c[3].country}`, formatNumber(c[3].cases.total))
				.addField(`\:medal:\t${c[4].country}`, formatNumber(c[4].cases.total))
				.setFooter(`Last Update: ${new Date().toISOString().substring(0, 10)}`)
			);
		}).catch(function (error) {
			console.error(error);
		});
	} else if (m[0] == 'country' && m.length > 1) { // Returns stats of the country you entered
		m.shift();
		options.url = 'https://covid-193.p.rapidapi.com/statistics';
		options.params = { country: m.join('-') };
		axios.request(options).then(function (response) {
			if (response.data.response.length) {
				let c = response.data.response[0];
				let country = c.country.replace(/-/g, ' ');
				let flag = `\:flag_${lookup(c.country).toLowerCase()}:`;
				msg.channel.send(new Discord.MessageEmbed()
					.setColor(color)
					.setTitle(`${flag ? flag : "\:earth_americas:"} ${country}`)
					.setDescription("Country Stats")
					.setThumbnail(thumb)
					.addField("Total Cases", formatNumber(c.cases.total))
					.addField("Recovered", formatNumber(c.cases.recovered))
					.addField("Deaths", formatNumber(c.deaths.total))
					.setFooter(`Last Update: ${new Date(c.time).toISOString().substring(0, 10)}`)
				);
			} else msg.channel.send(getHelpMessage());
		}).catch(function (error) {
			console.error(error);
		});
	} else if (m[0] == 'countries') { // Returns list of countries split into pages of 25
		options.url = 'https://covid-193.p.rapidapi.com/countries';
		delete options.params
		axios.request(options).then(function (response) {
			let l = response.data.response;
			if (l) {
				let index = (m[1] && m[1] > 0 && m[1] < Math.ceil(l.length / 25) + 1) ? m[1] : 1;
				msg.channel.send(getCountryList(index, l))
			}
		}).catch(function (error) {
			console.error(error);
		});
	} else if (m[0] == 'help') {
		msg.channel.send(getHelpMessage());
	}
});

// Discord js login token
client.login("<discord-token>");