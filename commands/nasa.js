const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const NASA_API_KEY = process.env.NASA_API_KEY;

module.exports = {
  name: 'nasa',
  description: 'NASA space image commands: apod, mars, epic, search',

  async execute(message, client, args) {
    if (!args.length) return message.reply('Usage: s!nasa <apod|mars|epic|search> [args]');
    
    const subcommand = args.shift().toLowerCase();

    switch(subcommand) {
      case 'apod':
        return apodCommand(message);
      case 'mars':
        return marsCommand(message, args);
      case 'epic':
        return epicCommand(message);
      case 'search':
        return searchCommand(message, args);
      default:
        return message.reply('Unknown command. Use apod, mars, epic, or search.');
    }
  }
};

async function apodCommand(message) {
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`);
    const data = await res.json();
    if (!data || data.media_type !== 'image') return message.channel.send('No image available today.');
    
    const embed = new EmbedBuilder()
      .setTitle('🌌 NASA Astronomy Picture of the Day')
      .setImage(data.url)
      .setDescription(data.explanation.length > 300 ? data.explanation.slice(0, 300) + '...' : data.explanation)
      .setColor(0x5865F2)
      .setFooter({ text: `Date: ${data.date} | Source: NASA APOD` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  } catch(e) {
    message.channel.send('Failed to fetch APOD.');
  }
}

async function marsCommand(message, args) {
  const rover = 'curiosity'; // Fixed rover, can be expanded later
  let sol = null;
  let earth_date = null;

  if (args[0] === 'sol' && args[1]) sol = args[1];
  else if (args[0] === 'date' && args[1]) earth_date = args[1];
  else return message.reply('Usage: s!nasa mars sol <sol_number> OR mars date <YYYY-MM-DD>');

  const query = sol ? `sol=${sol}` : `earth_date=${earth_date}`;

  try {
    const res = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?${query}&api_key=${NASA_API_KEY}`);
    const data = await res.json();

    if (!data.photos.length) return message.channel.send('No photos found for that query.');

    const photo = data.photos[0];
    const embed = new EmbedBuilder()
      .setTitle(`Mars Rover Photo - ${rover} - Sol: ${photo.sol}`)
      .setImage(photo.img_src)
      .setDescription(`Camera: ${photo.camera.full_name}`)
      .setColor(0x5865F2)
      .setFooter({ text: `Earth Date: ${photo.earth_date}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  } catch(e) {
    message.channel.send('Failed to fetch Mars photos.');
  }
}

async function epicCommand(message) {
  try {
    const res = await fetch(`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`);
    const data = await res.json();

    if (!data.length) return message.channel.send('No EPIC images available.');

    const image = data[Math.floor(Math.random() * data.length)];
    const datePath = image.date.split(' ')[0].replace(/-/g, '/');
    const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${datePath}/png/${image.image}.png`;

    const embed = new EmbedBuilder()
      .setTitle('🌍 NASA Earth EPIC Image')
      .setImage(imageUrl)
      .setDescription(image.caption)
      .setColor(0x5865F2)
      .setFooter({ text: `Date: ${image.date}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  } catch(e) {
    message.channel.send('Failed to fetch EPIC images.');
  }
}

async function searchCommand(message, args) {
  if (!args.length) return message.reply('Please provide search keywords.');

  try {
    const query = args.join('%20');
    const res = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image`);
    const data = await res.json();

    if (!data.collection.items.length) return message.channel.send('No media found.');

    const item = data.collection.items[0];
    const img = item.links ? item.links[0].href : null;
    const dataDesc = item.data[0];

    const embed = new EmbedBuilder()
      .setTitle(dataDesc.title)
      .setImage(img)
      .setDescription(dataDesc.description ? (dataDesc.description.length > 300 ? dataDesc.description.slice(0, 300) + '...' : dataDesc.description) : '')
      .setColor(0x5865F2)
      .setFooter({ text: `Date Created: ${dataDesc.date_created}` })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  } catch(e) {
    message.channel.send('Failed to search NASA media.');
  }
}
