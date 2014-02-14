var sessions_modal = null;
var languages_modal = null;

var modal_template = "<div class='modal fade'> \
							<div class='modal-dialog'> \
							    <div class='modal-content'> \
							    	<div class='modal-header'> \
							        	<h4 class='modal-title'></h4> \
							      	</div> \
							      	<div class='modal-body'></div> \
							      	<div class='modal-footer'> \
							        	<button type='button' class='btn btn-default btn-small' data-dismiss='modal'>Close</button> \
							        	<button type='button' class='btn btn-success btn-small save'>Ok</button> \
							      	</div> \
							    </div> \
							</div> \
						</div>"

var alert_template = '<div class="alert alert-danger"> \
						<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> \
						<span class="message">Message</span> \
					</div>'

jQuery(document).ready(function(){
	init();
});

function center_login_box()
{
	$('#login').css('top', (($(window).height() / 2) - ($('#login').height() / 2) - $('#errors').outerHeight()));
}

function center_sessions_modal()
{
	sessions_modal_dialog = sessions_modal.children('.modal-dialog');
	sessions_modal_content = sessions_modal_dialog.children('.modal-content');

	sessions_modal_dialog.css('top', (($(window).height() / 2) - (sessions_modal_content.height() / 2)));
}

function center_languages_modal()
{
	languages_modal_dialog = languages_modal.children('.modal-dialog');
	languages_modal_content = languages_modal_dialog.children('.modal-content');

	languages_modal_dialog.css('top', (($(window).height() / 2) - (languages_modal_content.height() / 2)));
}

// Called by MDM to disable user input
function mdm_disable()
{
	$('#login').find('input, button').attr('disabled', 'disabled');
}

// Called by MDM to enable user input
function mdm_enable()
{
	$('#login').find('input, button').removeAttr('disabled');
}

// Called by MDM to update the clock
function set_clock(message)
{
	$("#clock").html(message);
}

// Called by MDM to show a timed login countdown
function mdm_timed(message)
{
	add_alert(message);
}

// Called by MDM to show an error
function mdm_error(message)
{
	add_alert(message);
}

function add_alert(message)
{
	if (message != "")
	{
		var alert = $(alert_template);
		alert.find('.message').html(message);
		alert.appendTo('#errors');

		alerts = $('#errors').find('.alert:lt(-2)').fadeOut(800).remove();
	}
}

// Called by MDM to allow the user to input a username
function mdm_prompt(message)
{
	mdm_enable();
}

// Called by MDM to allow the user to input a password
function mdm_noecho(message)
{
	mdm_enable();
}

function init()
{
	center_login_box();
	init_sessions_modal();
	init_languages_modal();

	$('.actions a').tooltip();

	$("#suspend, #restart, #shutdown").bind('click', function(event){
		event.preventDefault();
		var self = $(this);

		bootbox.confirm("Are you sure?", function(result) {
			if (result == true)
			{
				//alert(self.data("target"));
			}
		});
	});

	$("#session").bind('click', function(event){
		event.preventDefault();
		display_sessions_modal();
	});

	$("#language").bind('click', function(event){
		event.preventDefault();
		display_language_modal();
	});


	$("body").on("keydown", function(event){
		if (event.keyCode == 13)
		{
			event.preventDefault();
			send_login();
		}
 	});

	$("#usernames-list").bind("change", function(event){
		event.preventDefault();

		var username = $(this).val();
		alert("USER###"+username.val());
	});

 	$("#login button[type=submit]").bind('click', function(event){
		event.preventDefault();
		send_login();
	});

 	$(window).resize(function(){
 		center_login_box();
		center_sessions_modal();
		center_languages_modal();
 	});

 	$('select').selectpicker({
 		'title': null,
 	});
}

function send_login()
{
	var password = $("#login input[name=password]");

	mdm_disable();
	alert("LOGIN###"+password.val());
}

function init_sessions_modal()
{
	sessions_modal = $(modal_template);
	sessions_modal.attr('id', 'sessions');
	sessions_modal.find('.modal-title').html('Sessions');
	sessions_modal.find('.modal-body').html('<select title="" id="sessions-list" name="session"></select>');
	sessions_modal.appendTo('body').show(function(){

		center_sessions_modal();

		sessions_modal.css('display', 'none').modal({
			'backdrop': 'static',
			'show': false,
		});
	});

	sessions_modal.find('button.save').bind('click', function(event){
		event.preventDefault();

		session = sessions_modal.find('select[name=session] option:selected');
		console.log(session);
		if (session.length > 0)
		{
			alert(session.val());
			sessions_modal.modal('hide');
		}
	});
}

function init_languages_modal()
{
	languages_modal = $(modal_template);
	languages_modal.attr('id', 'languages');
	languages_modal.find('.modal-title').html('Languages');
	languages_modal.find('.modal-body').html('<select title="" id="languages-list" name="language"></select>');
	languages_modal.appendTo('body').show(function(){

		center_languages_modal();

		languages_modal.css('display', 'none').modal({
			'backdrop': 'static',
			'show': false,
		});
	});

	languages_modal.find('button.save').bind('click', function(event){
		event.preventDefault();

		language = languages_modal.find('select[name=language] option:selected');

		if (language.length > 0)
		{
			alert(language.val());
			languages_modal.modal('hide');
		}
	});
}

function display_sessions_modal()
{
	sessions_modal.modal('show');
}

function display_language_modal()
{
	languages_modal.modal('show');
}

// Called by MDM to add a user to the list of users
function mdm_add_user(username, gecos, status)
{
	$('#usernames-list').append("<option value='"+username+"'>"+username+"</option>").selectpicker('refresh');
}

// Called by MDM to add a session to the list of sessions
function mdm_add_session(name, file)
{
	name = name.replace("Ubuntu", "Unity");

	$('#sessions-list').append("<option value='SESSION###"+name+"###"+file+"'>"+name+"</option>").selectpicker('refresh');
}

// Called by MDM to add a language to the list of languages
function mdm_add_language(name, code)
{
	var filename = code.toLowerCase().replace(".utf-8", "");
	var bits = filename.split("_");

	if (bits.length == 2)
	{
		filename = bits[1];
	}

	$('#languages-list').append("<option value='LANGUAGE###"+code+"' data-icon='flag flag-"+filename+"'>"+name+"</option>").selectpicker('refresh');
}

// Called by MDM if the SHUTDOWN command shouldn't appear in the greeter
function mdm_hide_shutdown()
{
	document.getElementById("shutdown").style.display = 'none';
}

// Called by MDM if the SUSPEND command shouldn't appear in the greeter
function mdm_hide_suspend()
{
	document.getElementById("suspend").style.display = 'none';
}

// Called by MDM if the RESTART command shouldn't appear in the greeter
function mdm_hide_restart()
{
	document.getElementById("restart").style.display = 'none';
}

// Called by MDM if the QUIT command shouldn't appear in the greeter
function mdm_hide_quit()
{
	document.getElementById("quit").style.display = 'none';
}

// Called by MDM if the XDMCP command shouldn't appear in the greeter
function mdm_hide_xdmcp()
{
	document.getElementById("xdmcp").style.display = 'none';
}
