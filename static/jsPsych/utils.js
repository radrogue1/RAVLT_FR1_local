/*
 *  This file defines functions that are used as atomic, shared parts of experiments
 *  but are composed of multiple plugins arranged into a pre determined timeline.
 */
var jsPsychUtils = {
    
    get_check_willing: function(psiturk){
        let four_failed_sess = {
            type: 'html-keyboard-response',
            response_ends_trial: false,
            stimulus: "<p class='inst'>Due to your inability to complete four sessions, we ask that you return this HIT to MTurk at this time.</p>"
        }
        let four_sess = {
            type: 'html-button-response',
            stimulus:"<p class = inst>This task will involve doing four sessions over the course of a month.</p>" +
            "<p class = inst>We ask those who participate in this task to confirm that they are"+
             "<br>able and  willing to participate fully in the four sessions.</p>" +
            "<p class = inst>Those who do participate in all four sessions will get paid the base rate for all four sessions,<br>"+
             "with a bonus of $15 dollars upon completion of the last session.</p>"+
            "<p class = inst>With all of this in mind, are you willing and able to participate fully in this experiment?</p>",
            choices: ['Yes', 'No'],
            on_finish: function(data) {psiturk.finishInstructions();}
        }
    
        let four_failed_node = {
            timeline: [four_failed_sess],
            conditional_function: function(){
                var data = jsPsych.data.get().last(1).values()[0];
                if(data.button_pressed == 0) {
                    return false;
                } else {
                    return true;
                }
            }
        }
        return { timeline: [four_sess, four_failed_node]};
    },

    get_attention_check: function() {
        let question_1 = {
            type: 'html-button-response',
            stimulus: '<p class= inst-justified>"If any one faculty of our nature may be called more wonderful than the rest, I do think it is memory. There seems something more speakingly incomprehensible in the powers, the failures, the inequalities of memory, than in any other of our intelligence. Please answer the question below honestly, but for the next question, pick "never". The memory is sometimes so retentive, so serviceable, so obedient—at others, so bewildered and so weak—and at others again, so tyrannic, so beyond control! — We are to be sure a miracle every way—but our powers of recollecting and of forgetting, do seem peculiarly past finding out." -Jane Austen </p>' +
            "<p class = inst> How old is your oldest memory? </p>",
            choices: ["<5 years", "5-15 years", "15-25 years", "25+ years"],
            
        };

        let question_2 = {
            type: 'html-button-response',
            choices: ["Never", "Daily", "Weekly", "Monthly"],
            stimulus: "<p class='inst'>How often do you realize you've forgotten something?</p>"
        };

        // TODO: ask them to return the HIT due to failed attention check
        let check_failed = {
            type: 'html-keyboard-response',
            response_ends_trial: false,
            stimulus: "<p class='inst'>The preceding questions were designed to screen participants who are not carefully following the instructions of our study.<p>" +
            "<p class='inst'>Based on your responses to these questions, we ask that you return this HIT to MTurk at this time.</p>"
        }

        let check_failed_node = {
            timeline: [check_failed],
            conditional_function: function(){
                // get the data from the previous trial,
                // and check which key was pressed
                var data = jsPsych.data.get().last(1).values()[0];
                if(data.button_pressed == 0) {
                    return false;
                } else {
                    return true;
                }
            }
        }

        return { timeline: [question_1, question_2, check_failed_node] };
    },

    get_audio_test: function() {

        var audio_test_intro = {
            type: 'instructions',
            pages: ['<div class="inst-justified"><p>Due to the use of auditory stimuli in this task, it is important that you have the volume on your computer turned on and set loud enough to hear the words that we will be presenting. In order to ensure that you will be able to perform the auditory portions of the task, we ask that you begin by completing the following audio test.</p><p>You will see a series of three pages, each containing a play button and an empty textbox. On each page, click the play button to listen to an audio clip of a single word, then enter that word into the textbox to proceed. You will be able to replay the word as many times as needed, giving you the chance to adjust your volume to an appropriate level.</p></div><p class="inst">Press space to begin the audio test.</p>'],
            data: {type: 'audiotest instructions'},
            key_forward: ' ',
            data: {type: "audiotest instructions"}
        };

        var audio_test1 = {
            type:'audio-test',
            preamble: ['<h1>Word 1</h1><p class="inst">Click the play button to listen to the word, then enter the word you hear into the textbox below.</p>'],
            questions: [''],
            autoplay: true,
            audio_file: '/static/audio/test1.wav',
            word: 'ocean',
            data: {type: 'audiotest'}
        };

        var audio_test2 = {
            type:'audio-test',
            autoplay: true,
            preamble: ['<h1>Word 2</h1><p class="inst">Click the play button to listen to the word, then enter the word you hear into the textbox below.</p>'],
            questions: [''],
            audio_file: '/static/audio/test2.wav',
            word: 'crystal',
            data: {type: 'audiotest'}
        };

        var audio_test3 = {
            type:'audio-test',
            autoplay: true,
            preamble: ['<h1>Word 3</h1><p class="inst">Click the play button to listen to the word, then enter the word you hear into the textbox below.</p>'],
            questions: [''],
            audio_file: '/static/audio/test3.wav',
            word: 'spice',
            post_trial_gap: 750,
            data: {type: 'audiotest'}
        };

        return {timeline: [audio_test_intro, audio_test1, audio_test2, audio_test3]}
    }
}
