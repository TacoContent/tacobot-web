
// Shared function to parse emoji values
function parseEmojiValue(emoji: string) {
  if (!emoji) return null;

  // check if string contains a unicode emoji (with or without skin tones, etc)
  const unicodeEmojiRegex = /\p{Extended_Pictographic}/u;
  if (unicodeEmojiRegex.test(emoji)) {
    return {
      unicode: emoji,
      id: null,
      name: null,
      animated: false,
    };
  }

  // Check if the emoji is a custom emoji
  const customEmojiRegex = /<(a)?:(\w+):(\d+)>/;
  const match = emoji.match(customEmojiRegex);
  if (match) {
    return {
      id: match[3],        // ID is the third capture group (digits)
      name: match[2],      // Name is the second capture group (word characters)
      animated: match[1] === 'a',  // Animated flag is the first capture group
      unicode: null
    };
  }

  // Check if it's just a numeric ID (Discord snowflake)
  if (/^\d{17,20}$/.test(emoji)) {
    return {
      id: emoji,
      name: null,
      animated: false,
      unicode: null
    };
  }

  // check if it matches a valid Discord emoji name (2-32 chars, alphanumeric and underscores, with : at start and end)
  const emojiNameRegex = /^:\w{2,32}:$/;
  if (emojiNameRegex.test(emoji)) {
    return {
      id: null,
      name: emoji.slice(1, -1),
      animated: false,
      unicode: null
    };
  }

  // Otherwise, it's a standard emoji or unknown
  return {
    id: null,
    name: null,
    animated: false,
    unicode: emoji
  };
}

export default {
  parseEmoji: function(this: any, ...args: any[]) {
    const [emoji] = args;
    return parseEmojiValue(emoji);
  },
  
  // Helper to get emoji ID from parsed emoji
  emojiId: function(this: any, ...args: any[]) {
    const [emoji] = args;
    if (!emoji) return null;
    
    const parsed = parseEmojiValue(emoji);
    return parsed ? parsed.id : null;
  },
  
  // Helper to get emoji name from parsed emoji
  emojiName: function(this: any, ...args: any[]) {
    const [emoji] = args;
    if (!emoji) return null;
    
    const parsed = parseEmojiValue(emoji);
    return parsed ? parsed.name : null;
  },
  
  // Helper to get emoji unicode from parsed emoji
  emojiUnicode: function(this: any, ...args: any[]) {
    const [emoji] = args;
    if (!emoji) return null;
    
    const parsed = parseEmojiValue(emoji);
    return parsed ? parsed.unicode : null;
  },
  
  // Helper to check if emoji is animated
  emojiAnimated: function(this: any, ...args: any[]) {
    const [emoji] = args;
    if (!emoji) return false;
    
    const parsed = parseEmojiValue(emoji);
    return parsed ? parsed.animated : false;
  },
  toEmojiString: function(this: any, ...args: any[]) {
    const [name, id, animated] = args;
    if (!name) return '';
    if (id) {
      return `<${animated ? 'a' : ''}:${name}:${id}>`;
    }
    return name; // return the unicode emoji as-is
  }
}