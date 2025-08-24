const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Initialize Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user.tag}!`);
});

// Function to announce new event
async function announceNewEvent(eventData) {
  try {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    if (!channel) {
      console.error('Discord channel not found');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎉 New Event: ${eventData.title}`)
      .setDescription(eventData.description || 'No description provided')
      .addFields(
        { name: '📅 Date & Time', value: new Date(eventData.event_date).toLocaleString(), inline: true },
        { name: '📍 Location', value: eventData.location || 'TBD', inline: true },
        { name: '👤 Organizer', value: eventData.creator_name || 'KAIST Student', inline: true }
      )
      .setColor(0x0099FF)
      .setTimestamp()
      .setFooter({ text: 'KAIST Micro-Event Board' });

    if (eventData.image_url && eventData.image_url.length > 0) {
      embed.setImage(eventData.image_url[0]);
    }

    const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventData.id}`;
    embed.setURL(eventUrl);

    await channel.send({ embeds: [embed] });
    console.log(`Event announced: ${eventData.title}`);
  } catch (error) {
    console.error('Error announcing event:', error);
  }
}

// Slash command for listing today's events
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'events') {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'today') {
      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: events, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            location,
            event_date,
            image_url,
            users!creator_id (name)
          `)
          .eq('status', 'upcoming')
          .gte('event_date', today.toISOString())
          .lt('event_date', tomorrow.toISOString())
          .order('event_date', { ascending: true });

        if (error) {
          await interaction.reply('Error fetching events');
          return;
        }

        if (events.length === 0) {
          await interaction.reply('No events scheduled for today');
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle('📅 Today\'s Events')
          .setColor(0x00FF00)
          .setTimestamp();

        events.forEach(event => {
          const eventTime = new Date(event.event_date).toLocaleTimeString();
          embed.addFields({
            name: `${event.title} - ${eventTime}`,
            value: `📍 ${event.location || 'TBD'}\n${event.description?.substring(0, 100) || 'No description'}...`,
            inline: false
          });
        });

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching today\'s events:', error);
        await interaction.reply('Error fetching events');
      }
    }
  }
});

// API endpoint to trigger event announcement
async function handleEventAnnouncement(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventData } = req.body;
  
  if (!eventData) {
    return res.status(400).json({ error: 'Event data required' });
  }

  await announceNewEvent(eventData);
  res.status(200).json({ success: true });
}

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = { announceNewEvent, handleEventAnnouncement };
