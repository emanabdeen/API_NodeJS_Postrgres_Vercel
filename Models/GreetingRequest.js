// GreetingRequest Model
class GreetingRequest {
    constructor(TimeOfDay, Language, Tone) {
      this.TimeOfDay = TimeOfDay;
      this.Language = Language;
      this.Tone = Tone;
    }
  }
  
  
  module.exports = GreetingRequest;