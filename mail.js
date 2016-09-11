// plugin context
rcube_webmail.prototype.contextmenu_folder = {};

// plugin name space
rcube_webmail.prototype.contextmenu_folder_key = function(name) {
	return 'plugin.contextmenu_folder.' + name; // keep in sync with *.php
}

// plugin client logger
rcube_webmail.prototype.contextmenu_folder_log = function(text, force) {
	if (this.contextmenu_folder_env('enable_logging') || force) {
		var name = arguments.callee.caller.name;
		var entry = this.contextmenu_folder_key(name);
		this.log(entry + ' : ' + text);
	}
};

// extract environment variable
rcube_webmail.prototype.contextmenu_folder_env = function(name) {
	return this.env[this.contextmenu_folder_key(name)];
}

// determine mail box type
rcube_webmail.prototype.contextmenu_folder_type = function(folder) {
	var folder_list = this.contextmenu_folder_env('special_folder_list');
	if ($.inArray(folder, folder_list) == -1) {
		return 'regular';
	} else {
		return 'special';
	}
}

// provide localization
rcube_webmail.prototype.contextmenu_folder_text = function(name) {
	return this.get_label(name, 'contextmenu_folder');
}

// control status object
rcube_webmail.prototype.contextmenu_folder_status = function() {
	var status = {
		show_mode : this.contextmenu_folder_env('show_mode')
	}
	return status;
}

// discover folder to be used by the command
rcube_webmail.prototype.contextmenu_folder_source = function(param) {
	var source;
	if (this.env.contextmenu_folder_source) {
		source = this.env.contextmenu_folder_source;
	} else if (this.env.mailbox) {
		source = this.env.mailbox;
	} else {
		this.contextmenu_folder_log('missing source', true);
		return;
	}
	var type = this.contextmenu_folder_type(source);
	if (param && param.ingore == type) {
		this.contextmenu_folder_log('ignore special', true);
		return;
	}
	return source;
}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_select = function(props, element,
		event) {
	var self = this;
	var source = self.contextmenu_folder_source();
	if (!source) {
		return;
	}
	var target = source;
	var action = self.contextmenu_folder_key('folder_select');
	self.http_post(action, {
		mode : props,
		source : source,
		target : target,
	}, self.set_busy(true, 'folder_select'));
}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_show_mode = function(props, element,
		event) {
	var self = this;
	var source = self.env.context_menu_source_id;
	var target = self.env.mailbox;
	var action = self.contextmenu_folder_key('show_mode');
	var show_mode = props;

	var title = 'invalid';
	var collect = 'invalid';

	switch (show_mode) {
	case 'reset_selected':
		title = self.contextmenu_folder_text('reset_selected');
		collect = 'collect_selected'; // keep in sync with *.php
		break;
	case 'reset_transient':
		title = self.contextmenu_folder_text('reset_transient');
		collect = 'collect_transient'; // keep in sync with *.php
		break;
	default:
		self.http_post(action, {
			show_mode : show_mode,
			source : source,
			target : target,
		}, self.set_busy(true, 'show_mode'));
		return;
	}

	// build reset prompt dialog

	var source_input = $('<input>').prop({
		id : 'source',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled'
	}).val(source);

	var target_input = $('<select>').prop({
		id : 'target',
		style : 'width: 40em; overflow: hidden;',
		size : 20, // rows
	}).keypress(function(event) {
		if (event.which == 13) {
			$('#submit').click();
		}
	});

	var source_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));
	var target_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));

	var content = $('<table>');
	// content.append($('<tr>').append($('<td>').append(source_label)).append(
	// $('<td>').append(source_input)));
	content.append($('<tr>').append(
			$('<td>').prop('colspan', 2).append(target_input)));

	var buttons = [ {
		id : 'submit',
		text : self.contextmenu_folder_text('reset'),
		class : 'mainaction',
		click : function() {
			self.http_post(action, {
				source : source,
				target : target,
				show_mode : show_mode,
			}, self.set_busy(true, 'show_mode'));
			$(this).dialog('close');
		}
	}, {
		id : 'cancel',
		text : self.contextmenu_folder_text('cancel'),
		click : function() {
			$(this).dialog('close');
		}
	} ];

	var request = self.contextmenu_folder_key('collect_list');

	function handler(param) { // ajax call back
		var target = $('#target');
		var folder_list = param['folder_list'];
		for (index in folder_list) {
			target.append($('<option>') //
			.prop('value', index).text(folder_list[index]));
		}
	}

	var options = {
		open : function(event, ui) {
			self.addEventListener(request, handler);
			self.http_post(request, {
				collect : collect,
				show_mode : show_mode,
			}, self.set_busy(true, 'collect_list'));
		},
		close : function(event, ui) {
			self.removeEventListener(request, handler);
			$(this).remove();
		},
	};

	self.contextmenu_folder.dialog = self.show_popup_dialog(content, title,
			buttons, options);

}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_create = function(props, element,
		event) {
	var self = this;

	var source = self.contextmenu_folder_source();
	if (!source) {
		return;
	}

	var target = source + '/';

	var source_input = $('<input>').prop({
		id : 'source',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled'
	}).val(source);

	var target_input = $('<input>').prop({
		id : 'target',
		type : 'text',
		size : 55
	}).val(target).keypress(function(event) {
		if (event.which == 13) {
			$('#submit').click();
		}
	});

	var source_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));
	var target_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));

	var content = $('<table>');
	// content.append($('<tr>').append($('<td>').append(source_label)).append(
	// $('<td>').append(source_input)));
	content.append($('<tr>').append($('<td>').append(target_label)).append(
			$('<td>').append(target_input)));

	var title = self.contextmenu_folder_text('folder_create');

	var buttons = [ {
		id : 'submit',
		text : self.contextmenu_folder_text('create'),
		class : 'mainaction',
		click : function() {
			var source = $('#source');
			var target = $('#target');
			var action = self.contextmenu_folder_key('folder_create');
			self.http_post(action, {
				source : source.val(),
				target : target.val()
			}, self.set_busy(true, 'folder_create'));
			$(this).dialog('close');
		}
	}, {
		id : 'cancel',
		text : self.contextmenu_folder_text('cancel'),
		click : function() {
			$(this).dialog('close');
		}
	} ];

	var options = {};

	self.contextmenu_folder.dialog = self.show_popup_dialog(content, title,
			buttons, options);
}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_delete = function(props, element,
		event) {
	var self = this;

	var source = self.contextmenu_folder_source({
		ignore : 'special'
	});
	if (!source) {
		return;
	}

	var target = source;

	var source_input = $('<input>').prop({
		id : 'source',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled'
	}).val(source);

	var target_input = $('<input>').prop({
		id : 'target',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled'
	}).val(target).keypress(function(event) {
		if (event.which == 13) {
			$('#submit').click();
		}
	});

	var source_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));
	var target_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));

	var content = $('<table>');
	// content.append($('<tr>').append($('<td>').append(source_label)).append(
	// $('<td>').append(source_input)));
	content.append($('<tr>').append($('<td>').append(target_label)).append(
			$('<td>').append(target_input)));

	var title = self.contextmenu_folder_text('folder_delete');

	var buttons = [ {
		id : 'submit',
		text : self.contextmenu_folder_text('delete'),
		class : 'mainaction',
		click : function() {
			var source = $('#source');
			var target = $('#target');
			var action = self.contextmenu_folder_key('folder_delete');
			self.http_post(action, {
				source : source.val(),
				target : target.val()
			}, self.set_busy(true, 'folder_delete'));
			$(this).dialog('close');
		}
	}, {
		id : 'cancel',
		text : self.contextmenu_folder_text('cancel'),
		click : function() {
			$(this).dialog('close');
		}
	} ];

	var options = {};

	self.contextmenu_folder.dialog = self.show_popup_dialog(content, title,
			buttons, options);
}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_rename = function(props, element,
		event) {
	var self = this;

	var source = self.contextmenu_folder_source({
		ignore : 'special'
	});
	if (!source) {
		return;
	}

	var target = source;

	var source_input = $('<input>').prop({
		id : 'source',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled'
	}).val(source);

	var target_input = $('<input>').prop({
		id : 'target',
		type : 'text',
		size : 55
	}).val(target).keypress(function(event) {
		if (event.which == 13) {
			$('#submit').click();
		}
	});

	var source_label = $('<label>')
			.text(self.contextmenu_folder_text('source'));
	var target_label = $('<label>')
			.text(self.contextmenu_folder_text('target'));

	var content = $('<table>');
	content.append($('<tr>').append($('<td>').append(source_label)).append(
			$('<td>').append(source_input)));
	content.append($('<tr>').append($('<td>').append(target_label)).append(
			$('<td>').append(target_input)));

	var title = self.contextmenu_folder_text('folder_rename');

	var buttons = [ {
		id : 'submit',
		text : self.contextmenu_folder_text('rename'),
		class : 'mainaction',
		click : function() {
			var source = $('#source');
			var target = $('#target');
			var action = self.contextmenu_folder_key('folder_rename');
			self.http_post(action, {
				source : source.val(),
				target : target.val()
			}, self.set_busy(true, 'folder_rename'));
			$(this).dialog('close');
		}
	}, {
		id : 'cancel',
		text : self.contextmenu_folder_text('cancel'),
		click : function() {
			$(this).dialog('close');
		}
	} ];

	var options = {};

	self.contextmenu_folder.dialog = self.show_popup_dialog(content, title,
			buttons, options);
}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_locate = function(props, element,
		event) {
	var self = this;

	$.expr[':'].match = function(e, i, m) {
		return $(e).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
	};

	var control_keys = // only non-edit
	[ 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40 ];

	var title = self.contextmenu_folder_text('folder_locate');

	function has_value(entry) {
		return entry && entry.val();
	}

	var source_input = $('<input>').prop({
		id : 'source',
		type : 'text',
		size : 55, // cols
	}).keydown(function(event) { // scroll folder list
		var target = $('#target');
		var option = target.find('option:selected');
		if (!(has_value(option))) {
			return;
		}
		switch (event.which) {
		case 38: // arrow up
			option = option.prevAll(':visible:first');
			break;
		case 40: // arrow down
			option = option.nextAll(':visible:first');
			break;
		default:
			return;
		}
		event.preventDefault();
		if (has_value(option)) {
			target.val(option.val());
		}
	}).keyup(function(event) { // search while typing
		if (event.which == 13) {
			$('#submit').click();
			return;
		}
		if ($.inArray(event.which, control_keys) > -1) {
			return;
		}
		var source = $('#source');
		var target = $('#target');
		var filter = source.val();
		if (filter) {
			target.find('option:not(:match(' + filter + '))').hide();
			target.find('option:match(' + filter + ')').show();
		} else {
			target.find('option').show();
		}
		var option = target.find('option:visible:first');
		if (has_value(option)) {
			target.val(option.val());
		}
	});

	var target_input = $('<select>').prop({
		id : 'target',
		style : 'width: 100%; overflow: hidden;',
		size : 20, // rows
	}).keypress(function(event) {
		if (event.which == 13) {
			$('#submit').click();
		}
	}).dblclick(function(event) {
		$('#submit').click();
	});

	var source_label = $('<label>')
			.text(self.contextmenu_folder_text('search'));
	var target_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));

	var content = $('<table>');
	content.append($('<tr>').append($('<td>').append(source_label)).append(
			$('<td>').append(source_input)));
	content.append($('<tr>').append(
			$('<td>').prop('colspan', 2).append(target_input)));

	var buttons = [ {
		id : 'submit',
		text : self.contextmenu_folder_text('locate'),
		class : 'mainaction',
		click : function() {
			var source = $('#source');
			var target = $('#target');
			var option = target.find('option:selected');
			var action = self.contextmenu_folder_key('show_folder');
			if (has_value(option)) {
				self.http_post(action, {
					source : source.val(),
					target : option.text()
				}, self.set_busy(true, 'show_folder'));
			}
			$(this).dialog('close');
		}
	}, {
		id : 'cancel',
		text : self.contextmenu_folder_text('cancel'),
		click : function() {
			$(this).dialog('close');
		}
	} ];

	function handler(param) { // ajax call back
		var source = $('#source');
		var target = $('#target');
		var folder_list = param['folder_list'];
		for (index in folder_list) {
			target.append($('<option>') //
			.prop('value', index).text(folder_list[index]));
		}
		source.trigger($.Event('keyup', { // select first
			which : 0
		}));
	}

	var action = self.contextmenu_folder_key('folder_list');

	var options = {
		open : function(event, ui) {
			self.addEventListener(action, handler);
			self.http_post(action, {}, self.set_busy(true, 'folder_list'));
		},
		close : function(event, ui) {
			self.removeEventListener(action, handler);
			$(this).remove();
		},
	};

	self.contextmenu_folder.dialog = self.show_popup_dialog(content, title,
			buttons, options);
}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_mark_read = function(props, element,
		event) {
	var self = this;

	var source = self.contextmenu_folder_source();
	if (!source) {
		return;
	}

	var target = source;

	function post_action() {
		var action = self.contextmenu_folder_key('folder_mark_read');
		self.http_post(action, {
			target : target,
			mark_mode : props
		}, self.set_busy(true, 'folder_mark_read'));
	}

	if (props != 'mark-tree') {
		post_action();
		return;
	}

	var source_input = $('<input>').prop({
		id : 'source',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled',
	}).val(source);

	var target_input = $('<input>').prop({
		id : 'target',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled',
	}).val(target);

	var source_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));
	var target_label = $('<label>')
			.text(self.contextmenu_folder_text('folder'));

	var content = $('<table>');
	content.append($('<tr>').append($('<td>').append(source_label)).append(
			$('<td>').append(source_input)));
	// content.append($('<tr>').append($('<td>').append(target_label)).append(
	// $('<td>').append(target_input)));

	var title = self.contextmenu_folder_text('folder_tree_mark_read');

	var buttons = [ {
		id : 'submit',
		text : self.contextmenu_folder_text('apply'),
		class : 'mainaction',
		click : function() {
			post_action();
			$(this).dialog('close');
		}
	}, {
		id : 'cancel',
		text : self.contextmenu_folder_text('cancel'),
		click : function() {
			$(this).dialog('close');
		}
	} ];

	var options = {};

	self.contextmenu_folder.dialog = self.show_popup_dialog(content, title,
			buttons, options);

}

// rcmail.command
rcube_webmail.prototype.contextmenu_folder_contact = function(props, element,
		event) {
	var self = this;

	this.contextmenu_folder_log('folder_contact: todo', true);
}

//
if (window.rcmail) {

	// use folder select for context menu as well
	rcmail.addEventListener('selectfolder', function(param) {
		var folder = param.folder;
		rcmail.env.context_menu_source_id = folder;
		rcmail.contextmenu_folder_log('select-folder: ' + folder);
	});

	// control folder source
	rcmail.addEventListener('menu-open', function(param) {
		var name = param.name;
		if (name == 'rcm_folderlist') {
			var source = rcmail.env.context_menu_source_id;
			rcmail.env.contextmenu_folder_source = source;
			rcmail.contextmenu_folder_log('menu-open  : ' + source);
		}
	});
	rcmail.addEventListener('menu-close', function(param) {
		var name = param.name;
		if (name == 'rcm_folderlist') {
			var source = null;
			rcmail.env.contextmenu_folder_source = source;
			rcmail.contextmenu_folder_log('menu-close : ' + source);
		}
	});

	//
	rcmail.addEventListener('init', function(param) {

		var log = rcmail.contextmenu_folder_log.bind(rcmail);
		var env_var = rcmail.contextmenu_folder_env.bind(rcmail);
		var localization = rcmail.contextmenu_folder_text.bind(rcmail);

		// https://github.com/roundcube/roundcubemail/issues/5424
		function select_folder() {
			if (rcmail.busy) {
				window.setTimeout(select_folder, 100);
			} else {
				var target = rcmail.env.mailbox;
				if (target) {
					rcmail.select_folder(target);
				}
			}
		}

		// provision static menu
		function provide_folder_contol_menu() {

			log('init');

			var folder_status = rcmail.contextmenu_folder_status();
			var show_mode = folder_status.show_mode;

			var status_id = 'contextmenu_folder_status';
			var status_title = localization('status_title');

			var status = $('<a>').prop({
				id : status_id,
				title : status_title,
				href : '#',
			})

			var content = $('<span>');
			content.attr('class', show_mode);

			status.append(content);

			var menu_id = rcmail.contextmenu_folder_key('status_menu_id');
			var menu_name = rcmail.contextmenu_folder_key('status_menu_name');

			var source = $('<ul>').prop({
				id : menu_id,
				style : 'display: none; visibility: hidden;',
			});

			var menu_source = [ menu_id ];

			menu_source.push({
				label : localization('show_all'),
				command : 'contextmenu_folder_show_mode',
				props : 'show_all',
				classes : 'override show_all'
			});
			menu_source.push({
				label : localization('show_active'),
				command : 'contextmenu_folder_show_mode',
				props : 'show_active',
				classes : 'override show_active'
			});
			menu_source.push({
				label : localization('show_favorite'),
				command : 'contextmenu_folder_show_mode',
				props : 'show_favorite',
				classes : 'override show_favorite'
			});
			menu_source.push({
				label : localization('reset_selected'),
				command : 'contextmenu_folder_show_mode',
				props : 'reset_selected',
				classes : 'override reset_selected'
			});
			menu_source.push({
				label : localization('reset_transient'),
				command : 'contextmenu_folder_show_mode',
				props : 'reset_transient',
				classes : 'override reset_transient'
			});
			menu_source.push({
				label : localization('folder_expand_all'),
				command : 'plugin.contextmenu.expandall',
				props : '',
				classes : 'expandall'
			});
			menu_source.push({
				label : localization('folder_collapse_all'),
				command : 'plugin.contextmenu.collapseall',
				props : '',
				classes : 'collapseall'
			});
			menu_source.push({
				label : localization('folder_locate'),
				command : 'contextmenu_folder_locate',
				props : '',
				classes : 'override folder_locate'
			});

			var menu = rcm_callbackmenu_init({
				menu_name : menu_name,
				menu_source : menu_source,
			});

			status.click(function(event) {
				rcm_show_menu(event, this, null, menu);
			});

			var mailboxmenulink = $('#mailboxmenulink');
			if (mailboxmenulink.length) {
				status.attr('role', mailboxmenulink.attr('role'));
				status.attr('class', mailboxmenulink.attr('class'));
				mailboxmenulink.after(status);
				mailboxmenulink.after(source);
			} else {
				log('missing #mailboxmenulink', true);
			}

		}

		select_folder();

		if (env_var('enable_folder_control_menu')) {
			provide_folder_contol_menu();
		}

	});

	// provision context menu
	rcmail.addEventListener('contextmenu_init', function(menu) {

		var log = rcmail.contextmenu_folder_log.bind(rcmail);
		var env_var = rcmail.contextmenu_folder_env.bind(rcmail);
		var localization = rcmail.contextmenu_folder_text.bind(rcmail);

		function is_array(object) {
			return Object.prototype.toString.call(object) === '[object Array]';
		}

		function provide_folder_context_menu() {
			log('init');

			if (!is_array(menu.menu_source)) {
				menu.menu_source = [ menu.menu_source ];
			}

			menu.menu_source.push({
				label : localization('folder_select'),
				command : 'contextmenu_folder_select',
				props : 'folder_select',
				classes : 'override folder_select'
			});
			menu.menu_source.push({
				label : localization('folder_unselect'),
				command : 'contextmenu_folder_select',
				props : 'folder_unselect',
				classes : 'override folder_unselect'
			});
			menu.menu_source.push({
				label : localization('folder_create'),
				command : 'contextmenu_folder_create',
				props : '',
				classes : 'override folder_create'
			});
			menu.menu_source.push({
				label : localization('folder_delete'),
				command : 'contextmenu_folder_delete',
				props : '',
				classes : 'override folder_delete'
			});
			menu.menu_source.push({
				label : localization('folder_rename'),
				command : 'contextmenu_folder_rename',
				props : '',
				classes : 'override folder_rename'
			});
			menu.menu_source.push({
				label : localization('folder_tree_mark_read'),
				command : 'contextmenu_folder_mark_read',
				props : 'mark-tree',
				classes : 'override folder_tree_mark_read'
			});

			menu.addEventListener('activate', function(args) {
				var source = rcmail.env.context_menu_source_id;
				var is_regular = //
				rcmail.contextmenu_folder_type(source) == 'regular';

				if (args.command == 'contextmenu_folder_mark_read') {
					return true;
				}
				if (args.command == 'contextmenu_folder_create') {
					return true;
				}
				if (args.command == 'contextmenu_folder_delete') {
					return is_regular;
				}
				if (args.command == 'contextmenu_folder_rename') {
					return is_regular;
				}
				if (args.command == 'contextmenu_folder_select') {
					return true;
				}
			});
		}

		function provide_message_list_menu() {
			log('init');

			if (!is_array(menu.menu_source)) {
				menu.menu_source = [ menu.menu_source ];
			}

			menu.menu_source.push({
				label : localization('folder_contact'),
				command : 'contextmenu_folder_contact',
				props : '',
				classes : 'override folder_contact'
			});

			menu.addEventListener('activate', function(args) {
				if (args.command == 'contextmenu_folder_contact') {
					return true;
				}
			});

		}

		if (env_var('enable_folder_context_menu')
				&& menu.menu_name == 'folderlist') {
			provide_folder_context_menu();
		}

		if (env_var('enable_message_list_menu')
				&& menu.menu_name == 'messagelist') {
			provide_message_list_menu();
		}

	});

}
