function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function loadSession(condition, counter) {
  // loads counterbalanced resource and starts experiment script
  await $.getScript("static/js/pregenerated_sessions/condition_" + condition + "/" + counter + ".js");
}

function addStimHTMLTags(list) {
    new_list = []
    for(var i = 0; i < list.length; i++) {
        new_list.push({stimulus: "<p id='stim'>".concat(list[i].toUpperCase(), "</p>")})
    }
    return new_list
}
