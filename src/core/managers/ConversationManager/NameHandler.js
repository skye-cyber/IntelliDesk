// Name extraction and cleaning utility
export const createNameHandler = () => {
  let conversationName = null;
  let nameExtractionComplete = false;

  return {
    // Extract name from content and return cleaned version
    processContent: function(content) {
      // Extract name only once
      if (!conversationName && !nameExtractionComplete) {
        const nameMatch = content.match(/<name>(.*?)<\/name>/);
        if (nameMatch) {
          conversationName = nameMatch[1];
          nameExtractionComplete = true;
        }
      }

      // Clean name tags from content
      const cleanedContent = content.replace(/<name>.*?<\/name>/g, '');

      return {
        cleanedContent,
        conversationName
      };
    },

    // Get current conversation name
    getName: function() {
      return conversationName;
    },

    // Reset handler for new conversation
    reset: function() {
      conversationName = null;
      nameExtractionComplete = false;
    }
  };
};

// Initialize name handler
export const nameHandler = createNameHandler();
