// commands/water.js
module.exports = {
  name: 'water',
  description: 'Sends an advanced, non-emoji reminder to hydrate and pings the hydration role.',
  async execute(message, client, args) {
    const roleId = '1415698521709084795';
    const waterMessages = [
      "Hydration Status: [LOW] — Time to refill your system! <@&" + roleId + ">",
      ">> Pro Tip: A well-hydrated brain thinks faster. Get some water! <@&" + roleId + ">",
      "=== DRINK WATER ALERT === Attention everyone in <@&" + roleId + ">, it's water o'clock.",
      "Fact: Even mild thirst can lower focus. Remedy: H₂O. <@&" + roleId + ">",
      "Reminder: Your cells called—they want more water! <@&" + roleId + ">",
      "--=[ Hydration Break ]=-- Step away for a sip. <@&" + roleId + ">",
      "| Pause | Hydrate | Resume | Your body will thank you, <@&" + roleId + ">.",
      "System Message: Hydration required—run the 'drink water' protocol. <@&" + roleId + ">",
      "Heads up! Dehydration can sneak up like a ninja. Outsmart it—grab that glass. <@&" + roleId + ">",
      "Bottled wisdom: Water fuels workflow. Go hydrate, <@&" + roleId + ">!",
      "Scientific update: Hydration increases energy. Apply now! <@&" + roleId + ">",
      "Achievement Unlocked: Hydration! (If you just took a sip) <@&" + roleId + ">",
      "If you see this message, the universe wants you to hydrate. <@&" + roleId + ">",
      "Notice: Human batteries recharge with water. Connect now! <@&" + roleId + ">",
      "Friendly nudge: Drinking water is a zero-cost upgrade. <@&" + roleId + ">"
    ];
    const randomMsg = waterMessages[Math.floor(Math.random() * waterMessages.length)];
    await message.channel.send(randomMsg);
  }
};
