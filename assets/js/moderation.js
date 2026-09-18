/**
 * Moderation System for Global Chat
 * Handles Anti-Spam, Profanity Filtering, and Sanitization
 */

// List of bad words (basic list, can be expanded)
const BAD_WORDS = [
  'puta', 'puto', 'mierda', 'cabron', 'cabrón', 'gilipollas', 'idiota',
  'imbecil', 'imbécil', 'joder', 'coño', 'verga', 'pene', 'polla',
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy'
];

export const Moderation = {
  lastMessageTime: 0,
  SPAM_COOLDOWN: 3000, // 3 seconds

  /**
   * Checks if the user is sending messages too quickly
   * @returns {boolean} True if spamming, False if safe
   */
  isSpamming() {
    const now = Date.now();
    if (now - this.lastMessageTime < this.SPAM_COOLDOWN) {
      return true;
    }
    this.lastMessageTime = now;
    return false;
  },

  /**
   * Replaces bad words with asterisks
   * @param {string} text 
   * @returns {string} Cleaned text
   */
  filterProfanity(text) {
    let cleanedText = text;
    BAD_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
    });
    return cleanedText;
  },

  /**
   * Escapes HTML characters to prevent XSS
   * @param {string} text 
   * @returns {string} Sanitized text
   */
  sanitize(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Validates and cleans a message
   * @param {string} text 
   * @returns {string|null} Cleaned text or null if invalid
   */
  processMessage(text) {
    if (!text || text.trim().length === 0) return null;

    // 1. Sanitize HTML (XSS Protection)
    let processed = this.sanitize(text.trim());

    // 2. Filter Profanity
    processed = this.filterProfanity(processed);

    return processed;
  }
};
