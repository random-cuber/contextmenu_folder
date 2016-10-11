// Plugin: contextmenu_folder
// Roundcube Context Menu Folder Manager
// Adds context menus with mailbox operations

// plugin class
function plugin_contextmenu_folder() {
	var self = this;

	// flat mailbox list, total
	this.parent_list = [];

	// flat mailbox list, total
	this.folder_list = [];

	// structured message header, selected
	this.header_list = [];

	// mailbox full path
	this.selected_folder = null;

	// message imap uid
	this.selected_message = null;

	// keep name: css
	this.status_id = 'plugin_contextmenu_folder_status';

	//
	this.collect_special = function() { // keep name
		return self.env('collect_special');
	}

	//
	this.collect_selected = function() { // keep name
		return self.env('collect_selected');
	}

	// 
	this.collect_transient = function() { // keep name
		return self.env('collect_transient');
	}

	// 
	this.collect_predefined = function() { // keep name
		return self.env('collect_predefined');
	}

	// plugin name space
	this.key = function(name) {
		return 'plugin.contextmenu_folder.' + name; // keep in sync with *.php
	}

	// plugin client logger
	this.log = function(text, force) {
		if (self.env('enable_logging') || force) {
			var name = arguments.callee.caller.name;
			var entry = self.key(name);
			rcmail.log(entry + ': ' + text);
		}
	};

	// plugin environment variable
	this.env = function(name) {
		return rcmail.env[self.key(name)];
	}

	// apply mailbox filter on server vs on client
	this.is_client_filter = function() {
		return self.env('enable_client_filter') || false;
	}

	// client ui behaviour
	this.has_feature = function has_feature(name) {
		return (self.env('feature_choice') || []).indexOf(name) >= 0;
	}

	// resolve string to jquery
	this.html_by_id = function(id) {
		return id.startsWith('#') ? $(id) : $('[id="' + id + '"]');
	}

	// imap folder path separator
	this.delimiter = function() {
		return rcmail.env.delimiter;
	}

	// filters defined by show mode
	this.filter_list = function filter_list(show_mode) {
		var show_mode = show_mode ? show_mode : self.env('show_mode');
		switch (show_mode) {
		default:
		case 'show_all':
			return []; // empty matches all
		case 'show_active':
			return self.env('filter_active');
			break;
		case 'show_favorite':
			return self.env('filter_favorite');
		}
	}

	// folder parent
	this.mbox_root = function mbox_root(mbox) {
		var delimiter = self.delimiter();
		if (mbox.indexOf(delimiter) >= 0) {
			var split = mbox.split(delimiter);
			split.pop();
			return split.join(delimiter);
		} else {
			return '';
		}
	}

	// folder base name
	this.mbox_name = function mbox_name(mbox) {
		var delimiter = self.delimiter();
		if (mbox.indexOf(delimiter) >= 0) {
			var split = mbox.split(delimiter);
			return split.pop();
		} else {
			return mbox;
		}
	}

	// extra functions
	this.jquery_extend = function jquery_extend() {
		$.fn.extend({
			// match all/any of space separated classes
			hasClass$List : function(type, klaz_text) {
				var mode;
				switch (type) {
				case 'all':
				case 'and':
					mode = true;
					break;
				case 'any':
				case 'or':
					mode = false;
					break;
				default:
					self.log('error: type=' + type, true);
					return false;
				}
				var node = this;
				var klaz_list = klaz_text.split(' ');
				for (var idx = 0, len = klaz_list.length; idx < len; idx++) {
					var has_klaz = $(node).hasClass(klaz_list[idx]);
					if (mode && has_klaz || !mode && !has_klaz) {
						continue;
					} else {
						return !mode;
					}
				}
				return mode;
			},
		});
	}

	// add/rem folder css
	this.mbox_mark = function mbox_mark(mbox, klaz, on) {
		var html_li_a = self.mbox_html_li_a(mbox);
		if (on) {
			html_li_a.addClass(klaz);
		} else {
			html_li_a.removeClass(klaz);
		}
	}

	// add/rem 'selected' folder css
	this.mbox_mark_selected = function mbox_mark_selected(mbox, on) {
		if (!self.has_feature('render_selected')) {
			return;
		}
		self.mbox_mark(mbox, self.icon_mapa('mark_selected'), on);
	}

	// rcmail folder identity
	this.mbox_rcm_id = function mbox_rcm_id(mbox) {
		return 'rcmli' + rcmail.html_identifier_encode(mbox);
	}

	// jquery ui folder object
	this.mbox_html_li = function mbox_html_li(mbox) {
		return self.html_by_id(self.mbox_rcm_id(mbox));
	}

	// jquery ui folder object
	this.mbox_html_li_a = function(mbox) {
		return self.mbox_html_li(mbox).find('a:first');
	}

	// filter assembly
	this.mbox_filter_entry = { // keep keys
		unread : function(mbox) {
			return rcmail.env.unread_counts[mbox] > 0;
		},
		special : function(mbox) {
			return self.collect_special()[mbox] ? true : false;
		},
		selected : function(mbox) {
			return self.collect_selected()[mbox] ? true : false;
		},
		transient : function(mbox) {
			return self.collect_transient()[mbox] ? true : false;
		},
		predefined : function(mbox) {
			return self.collect_predefined()[mbox] ? true : false;
		},
	}

	// provide filtered mailbox view (client filter)
	this.mbox_filter_apply = function mbox_filter_apply() {

		var show_mode = self.env('show_mode');
		self.log(show_mode);

		var treelist = rcmail.treelist;
		var container = treelist.container;

		switch (show_mode) {
		default:
		case 'show_all':
			container.find('li').show();
			return;
		case 'show_active':
		case 'show_favorite':
			break;
		}

		var filter_list = self.filter_list();

		function match(mbox) {
			for (var idx = 0, len = filter_list.length; idx < len; idx++) {
				var name = filter_list[idx];
				if (self.mbox_filter_entry[name](mbox)) {
					return true;
				}
			}
			return false;
		}

		container.find('li').hide();
		container.find('li').each(function filter_apply(index) {
			var html_li = $(this);
			var mbox = html_li.data('id');
			if (match(mbox)) {
				self.mbox_show_tree(mbox);
			}
		});
	}

	// paint folders form 'selected' collection
	this.mbox_render_selected = function mbox_render_selected(on) {
		var collect_selected = self.collect_selected();
		var mbox_list = Object.keys(collect_selected).sort();
		$.each(mbox_list, function(_, mbox) {
			self.mbox_mark_selected(mbox, on);
		});
	}

	// recursively expand and show folder
	this.mbox_show_tree = function mbox_show_tree(mbox) {
		// show folder <li>
		self.mbox_html_li(mbox).show();
		// navigate up tree
		var parent = self.mbox_root(mbox);
		if (parent) {
			self.mbox_show_tree(parent);
			rcmail.treelist.expand(parent);
		}
	}

	// folder: show, expand, scroll, refresh,
	this.mbox_locate = function mbox_locate(mbox) {
		var mbox = mbox ? mbox : self.mbox_source();
		self.log('mbox: ' + mbox);
		self.mbox_show_tree(mbox);
		rcmail.select_folder(mbox);
		rcmail.env.mailbox = mbox;
		rcmail.refresh_list();
	}

	// message
	this.mesg_locate = function mesg_locate(uid) {
		var uid = uid ? uid : self.selected_message;
		var message_list = rcmail.message_list;
		var rows = message_list ? message_list.rows : {};
		var row = rows[uid] ? rows[uid] : {};
		var row_id = row.id ? row.id : 'invalid';
		self.log('uid: ' + uid + ' row_id: ' + row_id);
		message_list && message_list.select(uid);
	}

	// empty folder collection
	this.mbox_reset_collect = function mbox_reset_collect(collect) {
		self.save_pref(collect, {});
	}

	// convert object to text
	this.json_encode = function(json, tabs) {
		return JSON.stringify(json, null, tabs);
	}

	// convert text to object
	this.json_decode = function(text) {
		return JSON.parse(text);
	}

	// substitution key format
	this.var_key = function(name) {
		return '{' + name + '}';
	}

	// substitution template processor
	this.var_subst = function var_subst(template, mapping) {
		var result = template;
		$.each(mapping, function(key, value) {
			var match = new RegExp(self.var_key(key), 'g');
			result = result.replace(match, value);
		});
		return result;
	}

	// determine folder type
	this.mbox_type = function mbox_type(folder) {
		return self.collect_special()[folder] ? 'special' : 'regular';
	}

	// server request/response processor class
	this.ajax_core = function ajax_core(name, request, response) {
		var core = this;
		core.name = name;
		core.action = self.key(name);
		core.request = function(param) {
			var param = request ? request(param) : param;
			if (param) {
				var lock = rcmail.set_busy(true, core.name);
				rcmail.http_post(core.action, param, lock);
			}
		}
		core.response = function(param) {
			response ? response(param) : true;
		}
		core.bind = function() {
			rcmail.addEventListener(core.action, core.response);
		}
		core.unbind = function() {
			rcmail.removeEventListener(core.action, core.response);
		}
	}

	// track headers on message selection change
	this.ajax_header_list = new self.ajax_core('header_list',
			function conf_header_list(uid) {
				var msg = rcmail.env.messages[uid];
				if (uid && msg && msg.mbox) {
					return {
						uid : uid,
						mbox : msg.mbox,
					};
				} else {
					self.log('missing selection');
					return null; // no post
				}
			}, // 
			function make_header_list(param) {
				self.header_list = param['header_list'];
				self.log('header_list: ' + self.header_list.length)
			});

	// obtain total mailbox collection
	this.ajax_folder_list = new self.ajax_core('folder_list',
			function conf_folder_list() {
				return {};
			}, //
			function make_folder_list(param) {
				self.folder_list = param['folder_list'];
				self.log('folder_list: ' + self.folder_list.length);
				window.setTimeout(self.update_parent_list, 100);
			});

	// apply ui for new messages
	function make_folder_notify(param) {
		var folder = param['folder'];
		self.log('folder: ' + folder);
		// folder auto show for 'unread'
		var filter_list = self.filter_list();
		if (filter_list.indexOf('unread') >= 0) {
			self.mbox_show_tree(folder);
		}
	}

	// reflect new folder messages
	this.ajax_folder_notify = new self.ajax_core('folder_notify', null,
			make_folder_notify);

	// apply ui create/delete/rename
	function make_folder_update(param) {
		var action = param['action'];
		var source = param['source'];
		var target = param['target'];
		self.log(action + ':' + source + ':' + target);
		var locate;
		switch (action) {
		case 'create':
			self.mbox_create(target);
			locate = target;
			break;
		case 'delete':
			self.mbox_delete(target);
			locate = self.mbox_root(target);
			break;
		case 'rename':
			self.mbox_delete(source);
			self.mbox_create(target);
			locate = target;
			break;
		default:
			self.log('invalid action: ' + action, true);
			return;
		}
		self.mbox_filter_apply();
		self.mbox_locate(locate);
	}

	// process server folder changes on client
	this.ajax_folder_update = new self.ajax_core('folder_update', null,
			make_folder_update);

	// reflect server folder scan action result
	function make_folder_scan_tree(param) {
		self.log(self.json_encode(param, 4));
		var scan_mode = param['scan_mode'];
		switch (scan_mode) {
		case 'read_this':
		case 'read_tree':
			if (self.has_feature('filter_on_mbox_mark_read')) {
				self.mbox_filter_apply();
			}
			break;
		default:
			self.log('invalid scan_mode: ' + scan_mode, true);
			return;
		}
	}

	// process server folder scan actions
	this.ajax_folder_scan_tree = new self.ajax_core('folder_scan_tree', null,
			make_folder_scan_tree);

	// plugin ui icons
	this.icon_mapa = function icon_mapa(name) {
		return self.env('icon_mapa')[name];
	}

	// pupulate context menu item
	this.menu_item = function menu_item(source, entry) {
		source.push({
			props : entry,
			label : self.localize(entry),
			command : self.key(entry),
			classes : 'override ' + self.icon_mapa(entry),
		});
	}

	// ui object
	this.mbox_create = function mbox_create(mbox) {
		var root = self.mbox_root(mbox);
		var name = self.mbox_name(mbox);
		var link = $('<a>').attr({
			href : '#', // FIXME
		}).click(function(event) {
			return rcmail.command('list', mbox, this, event);
		}).html(name);
		var node = {
			id : mbox,
			html : link,
			classes : [ 'mailbox' ],
		};
		var collect_transient = self.collect_transient();
		collect_transient[mbox] = mbox; // track
		rcmail.env.mailboxes[mbox] = node; // model
		rcmail.treelist.insert(node, root, 'mailbox'); // view
		self.save_pref('collect_transient', collect_transient);
	}

	// ui object
	this.mbox_delete = function mbox_delete(mbox) {
		var collect_transient = self.collect_transient();
		delete collect_transient[mbox]; // track
		delete rcmail.env.mailboxes[mbox]; // model
		rcmail.treelist.remove(mbox); // view
		self.save_pref('collect_transient', collect_transient);
	}

	// extract top level mailbox list
	this.update_parent_list = function() {
		var delimiter = self.delimiter();
		var index, length, folder, parent_list = [];
		length = self.folder_list.length;
		for (index = 0; index < length; ++index) {
			folder = self.folder_list[index];
			if (folder.indexOf(delimiter) === -1) {
				parent_list.push({
					folder : folder,
				});
			}
		}
		self.parent_list = parent_list;
	}

	// TODO
	this.update_collect = function update_collect(action, name, mbox) {
		var collect = name; // XXX
		switch (action) {
		case 'create':
			collect[mbox] = mbox;
			break;
		case 'delete':
			delete collect[mbox];
			break;
		}
	}

	// remember between sessions
	this.update_current_mailbox = function(mailbox) {
		var mailbox = mailbox ? mailbox : rcmail.env.mailbox;
		self.save_pref('memento_current_mailbox', mailbox);
	}

	// remember between sessions
	this.update_current_message = function(message) {
		var message = message ? message : self.selected_message;
		self.save_pref('memento_current_message', message);
	}

	// provide localization
	this.localize = function(name) {
		return rcmail.get_label(name, 'contextmenu_folder');
	}

	// discover folder to be used by the command
	this.mbox_source = function mbox_source(param) {
		var source;
		if (self.selected_folder) {
			source = self.selected_folder;
		} else if (rcmail.env.mailbox) {
			source = rcmail.env.mailbox;
		} else if (param) {
			source = param;
		} else {
			source = '';
			self.log('missing source', true);
		}
		return source;
	}

	// command helper
	this.register_command = function(name) {
		rcmail.register_command(self.key(name), self[name].bind(self), true);
	}

	// publish rcmail plugin commands
	this.register_command_list = function() {
		var command_list = [ //

		'contact_folder_create', //

		'folder_create', //
		'folder_delete', //
		'folder_locate', //
		'folder_rename', //
		'folder_select', //
		'folder_unselect', //

		'folder_read_this', //
		'folder_read_tree', //

		'show_all', //
		'show_active', //
		'show_favorite', //

		'reset_selected', //
		'reset_transient', //

		'message_copy', //
		'message_move', //

		];

		$.each(command_list, function(index, command) {
			self.register_command(command);
		});
	}

	// persist user settings on client and server
	this.save_pref = function save_pref(name, value, no_dump) {
		var key = self.key(name);
		rcmail.save_pref({
			env : key,
			name : key,
			value : value,
		});
		self.log(key + '=' + (no_dump ? '...' : self.json_encode(value)));
	}

	// jquery dialog title icon
	this.dialog_icon = function(dialog, name) {
		dialog.find('span.ui-dialog-title').addClass(
				'plugin_contextmenu_folder title_icon ' + name);
	}

	// convert keys to clicks
	this.key_enter = function key_enter(id, event) {
		switch (event.which) {
		case 9: // tab
		case 27: // esc
			return true; // event fire
		case 13: // enter
		case 32: // space
			self.html_by_id(id).click();
		default:
			return false; // event stop
		}
	}

	// buttons builder
	this.dialog_buttons = function(submit, cancel) {
		return [ {
			id : 'submit',
			text : self.localize( //
			submit && submit.name ? submit.name : 'submit'),
			class : 'mainaction',
			click : function() {
				if (!$('#submit').prop('disabled')) {
					submit && submit.func ? submit.func() : true;
				}
				$(this).dialog('close');
			},
			keydown : self.key_enter.bind(null, 'submit'),
		}, {
			id : 'cancel',
			text : self.localize( //
			cancel && cancel.name ? cancel.name : 'cancel'),
			click : function() {
				if (!$('#cancel').prop('disabled')) {
					cancel && cancel.func ? cancel.func() : true;
				}
				$(this).dialog('close');
			},
			keydown : self.key_enter.bind(null, 'cancel'),
		} ];

	}

	// options builder
	this.dialog_options = function(icon_name, func_open, func_close) {
		var icon = self.icon_mapa(icon_name);
		return {
			open : function open(event, ui) {
				self.dialog_icon($(this).parent(), icon ? icon : '');
				self.has_dialog = true;
				func_open ? func_open(event, ui) : true;
			},
			close : function close(event, ui) {
				func_close ? func_close(event, ui) : true;
				self.has_dialog = false;
				$(this).remove();
			},
		};
	}

	//
	this.is_plugin_active = function is_plugin_active() {
		return self.env('activate_plugin');
	}

	// //

	this.initialize();

}

// dialog content
plugin_contextmenu_folder.prototype.html_list = function html_list(args, opts) {
	var self = this;

	var field_list = args.field_list;
	var entry_list = args.entry_list;

	function part_id(name) {
		return args.name + '_' + name;
	}

	var content = $('<div>').attr({
		id : part_id('root'),
		class : 'uibox',
		style : 'max-height: 10em; overflow-x: hidden; overflow-y: auto;',
	});

	var table = $('<table>').attr({
		id : part_id('list'),
		role : 'listbox',
		class : 'records-table sortheader fixedheader', // TODO
	});
	content.append(table);

	var head = $('<thead>').attr({
		id : part_id('head'),
	});
	table.append(head);
	var row = $('<tr>');
	head.append(row);
	$.each(field_list, function(index, field) {
		row.append($('<th>').text(self.localize(field)));
	});

	var body = $('<tbody>').attr({
		id : part_id('body'),
	});
	table.append(body);

	var widget = new rcube_list_widget(table[0], opts).init();

	var inst_list = rcube_list_widget._instances;
	if ($.isArray(inst_list && inst_list[inst_list.length - 1]) == widget) {
		inst_list.pop(); // transient table, remove self
	}

	content.widget = widget;

	content.select = function content_select(id) { // row id
		self.log(args.name + ': ' + id);
		widget.select(id);
	}

	content.choice = function content_choice() { // selected object
		var id = widget.get_single_selection();
		return content.entry_list[id];
	}

	content.build = function content_build(entry_list) {
		content.entry_list = entry_list;
		widget.clear(true);
		$.each(entry_list, function(row_id, entry) {
			var cols = [];
			$.each(field_list, function(col_id, field) {
				cols.push({
					innerHTML : entry[field],
				});
			});
			widget.insert_row({
				id : 'rcmrow' + row_id,
				cols : cols,
			});
		});
	}

	content.build(entry_list);

	return content;
}

// plugin setup
plugin_contextmenu_folder.prototype.initialize = function initialize() {
	var self = this;

	if (self.is_plugin_active()) {
		self.log('active');
	} else {
		self.log('inactive');
		return;
	}

	if (rcmail.env['framed']) {
		self.log('error: framed', true);
		return;
	}

	// control resource select/unselect
	function rcmail_menu_work(action, param) {
		var name = param.name;
		var operation = name + ': ' + action + ': ';
		if (name == 'rcm_folderlist') { // plugin:contextmenu
			if (action == 'open') {
				self.selected_folder = rcmail.env.context_menu_source_id;
			}
			if (action == 'close') {
				self.selected_folder = null;
			}
			self.log(operation + self.selected_folder);
		}
		if (name == 'rcm_messagelist') { // plugin:contextmenu
			if (action == 'open') {
				self.selected_message = rcmail.get_single_uid();
				self.ajax_header_list.request(self.selected_message);
			}
			if (action == 'close') {
				self.selected_message = null;
			}
			self.log(operation + self.selected_message);
		}
	}

	// use folder select for context menu source
	function rcmail_select_folder(param) {
		var folder = param.folder;
		if (folder) {
			self.log(folder);
			rcmail.env.context_menu_source_id = folder;
			self.update_current_mailbox(folder);
		} else {
			self.log('...');
		}
	}

	// use message select for context menu headers
	function rcmail_select_message(widget) {
		var message = rcmail.get_single_uid();
		if (message) {
			self.log(message);
			self.selected_message = message;
			self.update_current_message(message); // save_pref
			window.setTimeout(function prevent_race_save_pref() {
				self.ajax_header_list.request(message);
			}, 100);
		} else {
			self.log('...');
		}
	}

	rcmail.addEventListener('menu-open', rcmail_menu_work.bind(null, 'open'));
	rcmail.addEventListener('menu-close', rcmail_menu_work.bind(null, 'close'));
	rcmail.addEventListener('selectfolder', rcmail_select_folder);

	if (rcmail.message_list) {
		rcmail.message_list.addEventListener('select', rcmail_select_message);
	}

	self.ajax_header_list.bind();
	self.ajax_folder_list.bind();
	self.ajax_folder_update.bind();
	self.ajax_folder_notify.bind();
	self.ajax_folder_scan_tree.bind();

	self.register_command_list();

	self.mbox_render_selected(true);

	window.setTimeout(function init_model() {
		self.log('...');
		self.ajax_folder_list.request();
	}, 500);

	if (self.is_client_filter()) {
		// FIXME replace delays with ready-events
		window.setTimeout(function remember_filter() {
			self.log('...');
			if (self.has_feature('remember_filter')) {
				self.mbox_filter_apply();
			}
			window.setTimeout(function remember_mailbox() {
				self.log('...');
				if (self.has_feature('remember_mailbox')) {
					self.mbox_locate(self.env('memento_current_mailbox'));
				}
				window.setTimeout(function remember_message() {
					self.log('...');
					if (self.has_feature('remember_message')) {
						self.mesg_locate(self.env('memento_current_message'));
					}
				}, 1500);
			}, 1500);
		}, 1500);
	} else {
		// noop
	}

}

// dialog content
plugin_contextmenu_folder.prototype.html_locate = function html_locate(args) {
	var self = this;

	$.expr[':'].match = function(e, i, m) {
		return $(e).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
	};

	var control_keys = // only non-edit
	[ 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40 ];

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

	function build_folder_list() {
		var source = $('#source');
		var target = $('#target');
		var folder_list = self.folder_list;
		$.each(folder_list, function(index, folder) {
			target.append($('<option>').prop('value', index).text(folder));
		});
		source.trigger($.Event('keyup', { // select first
			which : 0
		}));
	}

	window.setTimeout(build_folder_list, 10);

	var source_label = $('<label>').text(self.localize('search'));
	var target_label = $('<label>').text(self.localize('folder'));

	var content = $('<table>');
	content.append($('<tr>').append($('<td>').append(source_label)).append(
			$('<td>').append(source_input)));
	content.append($('<tr>').append(
			$('<td>').prop('colspan', 2).append(target_input)));

	return content;
}

// plugin command
plugin_contextmenu_folder.prototype.contact_folder_create = function contact_folder_create() {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var uid = self.selected_message;
	var msg = rcmail.env.messages[uid];
	self.log('uid: ' + uid);

	var content = $('<div>');

	var parent_part = self.html_list({
		name : 'parent_part',
		field_list : [ 'folder' ],
		entry_list : self.parent_list,
	});

	parent_part.widget.addEventListener('select', function(widget) {
		var item = widget.get_single_selection();
		if (item) {
			self.save_pref('memento_contact_parent_item', item);
			update_format_part();
		}
	});

	var header_part = self.html_list({
		name : 'header_part',
		field_list : [ 'type', 'full_name', 'mail_addr', ],
		entry_list : self.header_list,
	});

	header_part.widget.addEventListener('select', function(widget) {
		var item = widget.get_single_selection();
		if (item) {
			self.save_pref('memento_contact_header_item', item);
			update_format_part();
		}
	});

	var format_part = self.html_list({
		name : 'format_part',
		field_list : [ 'folder' ],
		entry_list : [], // build on demand
	});

	format_part.widget.addEventListener('select', function(widget) {
		var item = widget.get_single_selection();
		if (item) {
			self.save_pref('memento_contact_format_item', item);
			update_folder_part();
		}
	});

	var folder_part = $('<input>').attr({
		id : 'target',
		style : 'width:100%;',
	}).keypress(function(event) {
		if (event.which == 13) {
			$('#submit').click();
		}
	});

	function section(id) {
		return $('<label>').css({
			'font-weight' : 'bold',
		}).text(self.localize(id));
	}

	content.append(section('parent'));
	content.append(parent_part);
	content.append($('<p>'));
	content.append(section('header'));
	content.append(header_part);
	content.append($('<p>'));
	content.append(section('format'));
	content.append(format_part);
	content.append($('<p>'));
	content.append(section('folder'));
	content.append($('<br>'));
	content.append(folder_part);

	function update_format_part() {
		var parent = parent_part.choice();
		var header = header_part.choice();
		if (!parent || !header) {
			return;
		}
		var mapping = { // store key=value
			parent : parent.folder,
		};
		$.each(header, function(key, value) { // store key=value
			mapping[key] = value;
		});
		var entry_list = [];
		var format_list = self.env('contact_folder_format_list');
		$.each(format_list, function(index, format) { // substitute format
			var folder = self.var_subst(format, mapping);
			entry_list.push({
				folder : folder,
			});
		});
		format_part.build(entry_list);
		format_part.select(self.env('memento_contact_format_item'));
	}

	function update_folder_part() {
		var format = format_part.choice();
		if (!format) {
			return;
		}
		folder_part.val(format.folder);
	}

	var title = self.localize('folder_create');

	var ajax = new self.ajax_core('folder_create', function request() {
		var target = $('#target');
		return {
			target : target.val(),
		}
	});

	var buttons = self.dialog_buttons({
		name : 'create',
		func : ajax.request,
	});

	function open() {
		parent_part.select(self.env('memento_contact_parent_item'));
		header_part.select(self.env('memento_contact_header_item'));
		format_part.select(self.env('memento_contact_format_item'));
	}

	var options = self.dialog_options('folder_create', open);

	rcmail.show_popup_dialog(content, title, buttons, options);
}

// plugin command
plugin_contextmenu_folder.prototype.folder_create = function folder_create() {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var source = self.mbox_source();
	if (!source) {
		return;
	}

	var target = source + '/';

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
		size : 55
	}).keypress(function(event) {
		if (event.which == 13) {
			$('#submit').click();
		}
	}).on('input', function(event) {
		render();
	}).val(target);

	function render() {
		$('#submit').prop('disabled', source == $('#target').val());
	}

	var source_label = $('<label>').text(self.localize('folder'));
	var target_label = $('<label>').text(self.localize('folder'));

	var content = $('<table>');
	// content.append($('<tr>').append($('<td>').append(source_label)).append(
	// $('<td>').append(source_input)));
	content.append($('<tr>').append($('<td>').append(target_label)).append(
			$('<td>').append(target_input)));

	var title = self.localize('folder_create');

	var ajax = new self.ajax_core('folder_create', function request() {
		var source = $('#source');
		var target = $('#target');
		return {
			source : source.val(),
			target : target.val(),
		}
	});

	var buttons = self.dialog_buttons({
		name : 'create',
		func : ajax.request,
	});

	var options = self.dialog_options('folder_create');

	rcmail.show_popup_dialog(content, title, buttons, options);
}

// plugin command
plugin_contextmenu_folder.prototype.folder_delete = function folder_delete() {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var source = self.mbox_source();
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

	var source_label = $('<label>').text(self.localize('folder'));
	var target_label = $('<label>').text(self.localize('folder'));

	var content = $('<table>');
	// content.append($('<tr>').append($('<td>').append(source_label)).append(
	// $('<td>').append(source_input)));
	content.append($('<tr>').append($('<td>').append(target_label)).append(
			$('<td>').append(target_input)));

	var title = self.localize('folder_delete');

	var ajax = new self.ajax_core('folder_delete', function request() {
		var source = $('#source');
		var target = $('#target');
		return {
			source : source.val(),
			target : target.val(),
		}
	});

	var buttons = self.dialog_buttons({
		name : 'delete',
		func : ajax.request,
	});

	function render() {
		var type = self.mbox_type(source);
		if (type == 'special') {
			$('#submit').prop('disabled', true);
		}
	}

	function open() {
		render();
	}

	var options = self.dialog_options('folder_delete', open);

	rcmail.show_popup_dialog(content, title, buttons, options);
}

// plugin command
plugin_contextmenu_folder.prototype.folder_rename = function folder_rename() {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var source = self.mbox_source();
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
	}).on('input', function(event) {
		render();
	});

	var source_label = $('<label>').text(self.localize('source'));
	var target_label = $('<label>').text(self.localize('target'));

	var content = $('<table>');
	content.append($('<tr>').append($('<td>').append(source_label)).append(
			$('<td>').append(source_input)));
	content.append($('<tr>').append($('<td>').append(target_label)).append(
			$('<td>').append(target_input)));

	var title = self.localize('folder_rename');

	var ajax = new self.ajax_core('folder_rename', function request() {
		var source = $('#source');
		var target = $('#target');
		return {
			source : source.val(),
			target : target.val(),
		}
	});

	var buttons = self.dialog_buttons({
		name : 'rename',
		func : ajax.request,
	});

	function render() {
		var type = self.mbox_type(source);
		if (type == 'special') {
			$('#submit').prop('disabled', true);
			return;
		}
		$('#submit').prop('disabled', source == $('#target').val());
	}

	function open() {
		render();
	}

	var options = self.dialog_options('folder_rename', open);

	rcmail.show_popup_dialog(content, title, buttons, options);
}

// plugin command
plugin_contextmenu_folder.prototype.folder_locate = function folder_locate() {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var content = self.html_locate();

	var title = self.localize('folder_locate');

	var ajax = new self.ajax_core('folder_locate', function request() {
		var source = $('#source');
		var target = $('#target');
		var option = target.find('option:selected');
		var folder = option.text();
		if (self.is_client_filter()) {
			self.mbox_locate(folder);
			return null; // no post
		} else {
			return {
				target : folder,
			}
		}
	});

	var buttons = self.dialog_buttons({
		name : 'locate',
		func : ajax.request,
	});

	function open() {
		$('#source').val(self.env('memento_folder_locate_text')).focus()
				.select();
	}

	function close() {
		self.save_pref('memento_folder_locate_text', $('#source').val());
	}

	var options = self.dialog_options('folder_locate', open, close);

	rcmail.show_popup_dialog(content, title, buttons, options);
}

// plugin command
plugin_contextmenu_folder.prototype.folder_select = function folder_select() {
	var self = this;
	self.folder_change_select('folder_select');
}

// plugin command
plugin_contextmenu_folder.prototype.folder_unselect = function folder_unselect() {
	var self = this;
	self.folder_change_select('folder_unselect');
}

// command provider
plugin_contextmenu_folder.prototype.folder_change_select = function folder_change_select(
		props) {
	var self = this;

	var mode = props;
	var source = self.mbox_source();
	var target = source;
	if (!source) {
		return;
	}

	if (self.is_client_filter()) {
		var collect_selected = self.collect_selected();
		switch (mode) {
		case 'folder_select':
			collect_selected[source] = source;
			self.mbox_mark_selected(source, true);
			break;
		case 'folder_unselect':
			delete collect_selected[source];
			self.mbox_mark_selected(source, false);
			break;
		default:
			self.log('invalid mode: ' + mode);
			break;
		}
		self.save_pref('collect_selected', collect_selected);
	} else {
		var action = self.key('folder_select');
		rcmail.http_post(action, {
			mode : mode,
			source : source,
			target : target,
		}, rcmail.set_busy(true, 'folder_select'));
	}

}

// plugin command
plugin_contextmenu_folder.prototype.folder_read_this = function folder_read_this() {
	var self = this;
	self.folder_scan_tree('read_this');
}

// plugin command
plugin_contextmenu_folder.prototype.folder_read_tree = function folder_read_tree() {
	var self = this;
	self.folder_scan_tree('read_tree');
}

// command provider
plugin_contextmenu_folder.prototype.folder_scan_tree = function folder_scan_tree(
		props) {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var scan_mode = props;
	var source = self.mbox_source();
	var target = source;

	if (!source) {
		return;
	}

	var source_input = $('<input>').prop({
		id : 'source',
		type : 'text',
		size : 55,
		readonly : 'true',
		disabled : 'disabled',
	}).val(source);

	var target_input = $('<textarea>').prop({
		id : 'target',
		type : 'text',
		rows : 7,
		cols : 55,
		readonly : 'true',
		disabled : 'disabled',
	}).val('');

	var folder_rx = '';
	switch (scan_mode) {
	case 'read_this':
		folder_rx = new RegExp('^' + source + '$');
		break;
	case 'read_tree':
		folder_rx = new RegExp('^' + source + '/.+$');
		break;
	}

	$.each(self.folder_list, function(_, folder) {
		var has_match = folder_rx.test(folder);
		var has_unread = self.mbox_filter_entry.unread(folder);
		if (has_match && has_unread) {
			target_input.val(target_input.val() + folder + '\n');
		}
	});

	var source_label = $('<label>').text(self.localize('folder'));
	var target_label = $('<label>').text(self.localize(''));

	var content = $('<table>');
	content.append($('<tr>').append($('<td>').append(source_label)).append(
			$('<td>').append(source_input)));
	content.append($('<tr>').append($('<td>').append(target_label)).append(
			$('<td>').append(target_input)));

	var title = self.localize('folder_' + scan_mode);

	function post_ajax() {
		self.ajax_folder_scan_tree.request({
			target : target,
			scan_mode : scan_mode,
		});
	}

	var buttons = self.dialog_buttons({
		name : 'apply',
		func : post_ajax,
	});

	var options = self.dialog_options('folder_read_tree');

	rcmail.show_popup_dialog(content, title, buttons, options);

}

// plugin command
plugin_contextmenu_folder.prototype.reset_selected = function reset_selected() {
	var self = this;
	self.reset_collect('selected');
}

// plugin command
plugin_contextmenu_folder.prototype.reset_transient = function reset_transient() {
	var self = this;
	self.reset_collect('transient');
}

// command provider
plugin_contextmenu_folder.prototype.reset_collect = function reset_collect(
		props) {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var source = rcmail.env.context_menu_source_id;
	var target = rcmail.env.mailbox;

	var mode = 'reset_' + props;
	var title = self.localize(mode);
	var collect = 'collect_' + props;

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

	var source_label = $('<label>').text(self.localize('folder'));
	var target_label = $('<label>').text(self.localize('folder'));

	var content = $('<table>');
	// content.append($('<tr>').append($('<td>').append(source_label)).append(
	// $('<td>').append(source_input)));
	content.append($('<tr>').append(
			$('<td>').prop('colspan', 2).append(target_input)));

	var ajax_reset_collect = new self.ajax_core('reset_collect',
			function request() {
				if (collect == 'collect_selected') {
					self.mbox_render_selected(false);
				}
				if (self.is_client_filter()) {
					self.mbox_reset_collect(collect);
					return null; // no post
				} else {
					return {
						collect : collect,
					}
				}
			});

	var ajax_collect_list = new self.ajax_core('collect_list',
			function request() {
				return {
					collect : collect,
				};
			}, //
			function response(param) {
				var target = $('#target');
				var folder_list = param['folder_list'] || [];
				$.each(folder_list, function(index, folder) {
					$('<option>').prop('value', index).text(folder).appendTo(
							target);
				});
			});

	var buttons = self.dialog_buttons({
		name : 'reset',
		func : ajax_reset_collect.request,
	});

	function open() {
		if (self.is_client_filter()) {
			var func = self[collect];
			var folder_list = Object.keys(func()).sort();
			ajax_collect_list.response({
				folder_list : folder_list,
			});
		} else {
			ajax_collect_list.bind();
			ajax_collect_list.request();
		}
	}

	function close() {
		if (self.is_client_filter()) {
			self.mbox_filter_apply();
		} else {
			ajax_collect_list.unbind();
		}
	}

	var options = self.dialog_options(mode, open, close);

	rcmail.show_popup_dialog(content, title, buttons, options);

}

// plugin command
plugin_contextmenu_folder.prototype.show_all = function show_all() {
	var self = this;
	self.show_mode('show_all');
}

// plugin command
plugin_contextmenu_folder.prototype.show_active = function show_active() {
	var self = this;
	self.show_mode('show_active');
}

// plugin command
plugin_contextmenu_folder.prototype.show_favorite = function show_favorite() {
	var self = this;
	self.show_mode('show_favorite');
}

// command provider
plugin_contextmenu_folder.prototype.show_mode = function show_mode(props) {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	self.log('props: ' + props);

	var source = rcmail.env.context_menu_source_id;
	var target = rcmail.env.mailbox;
	var show_mode = props;

	self.save_pref('show_mode', show_mode);
	self.html_by_id(self.status_id).trigger('show_mode');

	var ajax = new self.ajax_core('show_mode', function request() {
		return {
			source : source,
			target : target,
			show_mode : show_mode,
		}
	});

	if (self.is_client_filter()) {
		self.mbox_filter_apply();
		self.mbox_locate();
	} else {
		ajax.request();
	}

}

// plugin command
plugin_contextmenu_folder.prototype.message_copy = function message_copy() {
	var self = this;
	self.message_transfer('message_copy');
}

// plugin command
plugin_contextmenu_folder.prototype.message_move = function message_move() {
	var self = this;
	self.message_transfer('message_move');
}

// command provider
plugin_contextmenu_folder.prototype.message_transfer = function message_transfer(
		props) {
	var self = this;

	if (self.has_dialog) {
		return;
	}

	var action = props;
	var content = self.html_locate();

	var title = 'invalid';
	var command = function command(mbox) {
		self.log(title);
	};

	switch (action) {
	case 'message_copy':
		title = self.localize('message_copy');
		command = rcmail.copy_messages.bind(rcmail);
		break;
	case 'message_move':
		title = self.localize('message_move');
		command = rcmail.move_messages.bind(rcmail);
		break;
	default:
		self.log('invalid action: ' + action, true);
		return;
	}

	function post_ajax() {
		var target = $('#target');
		var option = target.find('option:selected');
		if (option && option.val()) {
			var folder = option.text();
			self.log(action + ': ' + folder);
			command(folder); // rcmail command
		} else {
			self.log(action + ': ' + 'missing folder');
		}
	}

	var buttons = self.dialog_buttons({
		name : 'apply',
		func : post_ajax,
	});

	function open() {
		$('#source').val(self.env('memento_folder_locate_text')).focus()
				.select();
	}

	function close() {
		self.save_pref('memento_folder_locate_text', $('#source').val());
	}

	var options = self.dialog_options('folder_locate', open, close);

	rcmail.show_popup_dialog(content, title, buttons, options);
}

// menu setup
plugin_contextmenu_folder.prototype.mbox_list_control_menu = function mbox_list_control_menu() {
	var self = this;
	var enable = self.env('enable_folder_list_control_menu');
	self.log('enable: ' + enable);
	if (!enable) {
		return;
	}

	var show_mode = self.env('show_mode');
	self.log('show_mode: ' + show_mode);

	var status = $('<a>').prop({
		id : self.status_id,
		title : self.localize('status_title'),
		href : '#',
	})

	var content = $('<span>').attr({
		class : self.icon_mapa(show_mode),
	}).appendTo(status);

	var menu_id = self.key('status_menu_id');
	var menu_name = self.key('status_menu_name');

	var source = $('<ul>').prop({
		id : menu_id,
		style : 'display: none; visibility: hidden;',
	});

	var menu_source = [ menu_id ];

	self.menu_item(menu_source, 'show_all');
	self.menu_item(menu_source, 'show_active');
	self.menu_item(menu_source, 'show_favorite');
	self.menu_item(menu_source, 'reset_selected');
	self.menu_item(menu_source, 'reset_transient');

	menu_source.push({
		label : self.localize('folder_expand_all'),
		command : 'plugin.contextmenu.expandall',
		props : '',
		classes : 'expandall'
	});
	menu_source.push({
		label : self.localize('folder_collapse_all'),
		command : 'plugin.contextmenu.collapseall',
		props : '',
		classes : 'collapseall'
	});

	self.menu_item(menu_source, 'folder_locate');

	var menu = rcm_callbackmenu_init({ // plugin:contextmenu
		menu_name : menu_name,
		menu_source : menu_source,
	});

	status.on('click contextmenu', function(event) {
		rcm_show_menu(event, this, null, menu); // plugin:contextmenu
	});

	status.on('show_mode', function(event) {
		var show_mode = self.env('show_mode');
		content.attr({
			class : self.icon_mapa(show_mode),
		});
	});

	var mailboxmenulink = $('#mailboxmenulink'); // template:
	if (mailboxmenulink.length) {
		status.attr('role', mailboxmenulink.attr('role'));
		status.attr('class', mailboxmenulink.attr('class'));
		mailboxmenulink.after(status);
		mailboxmenulink.after(source);
	} else {
		self.log('missing #mailboxmenulink', true);
	}

}

// menu setup
plugin_contextmenu_folder.prototype.mbox_list_context_menu = function mbox_list_context_menu(
		menu) {
	var self = this;
	if (menu.menu_name != 'folderlist') {
		return;
	}
	var enable = self.env('enable_folder_list_context_menu');
	self.log('enable: ' + enable);
	if (!enable) {
		return;
	}

	if (!$.isArray(menu.menu_source)) {
		menu.menu_source = [ menu.menu_source ];
	}

	var menu_source = menu.menu_source;
	self.menu_item(menu_source, 'folder_select');
	self.menu_item(menu_source, 'folder_unselect');
	self.menu_item(menu_source, 'folder_create');
	self.menu_item(menu_source, 'folder_delete');
	self.menu_item(menu_source, 'folder_rename');
	self.menu_item(menu_source, 'folder_read_tree');

	menu.addEventListener('activate', function activate(args) {
		var source = rcmail.env.context_menu_source_id;
		function is_regular() {
			return self.mbox_type(source) == 'regular';
		}
		function is_selected() {
			return typeof self.collect_selected()[source] !== 'undefined';
		}
		if (args.command == self.key('folder_create')) {
			return true;
		}
		if (args.command == self.key('folder_delete')) {
			return is_regular();
		}
		if (args.command == self.key('folder_rename')) {
			return is_regular();
		}
		if (args.command == self.key('folder_select')) {
			return !is_selected();
		}
		if (args.command == self.key('folder_unselect')) {
			return is_selected();
		}
		if (args.command == self.key('folder_read_tree')) {
			return true;
		}
	});
}

// menu setup
plugin_contextmenu_folder.prototype.mesg_list_context_menu = function mesg_list_context_menu(
		menu) {
	var self = this;
	if (menu.menu_name != 'messagelist') {
		return;
	}
	var enable = self.env('enable_message_list_context_menu');
	self.log('enable: ' + enable);
	if (!enable) {
		return;
	}

	if (!$.isArray(menu.menu_source)) {
		menu.menu_source = [ menu.menu_source ];
	}

	menu.menu_source.push({
		label : self.localize('folder_create'),
		command : self.key('contact_folder_create'),
		props : '',
		classes : 'override ' + self.icon_mapa('folder_create'),
	});

	menu.menu_source.push({
		label : self.localize('message_copy'),
		command : self.key('message_copy'),
		props : '',
		classes : 'copy copycontact', // FIXME css
	});
	menu.menu_source.push({
		label : self.localize('message_move'),
		command : self.key('message_move'),
		props : '',
		classes : 'move movecontact', // FIXME css
	});

}

// plugin context
if (window.rcmail && !rcmail.is_framed()) {

	// plugin instance
	rcmail.addEventListener('init', function instance(param) {
		plugin_contextmenu_folder.instance = new plugin_contextmenu_folder();
	});

	// build control menu
	rcmail.addEventListener('init', function control_menu(param) {
		var instance = plugin_contextmenu_folder.instance;
		if (instance && instance.is_plugin_active()) {
			instance.mbox_list_control_menu();
		}
	});

	// build context menu
	rcmail.addEventListener('contextmenu_init', function context_menu(menu) {
		var instance = plugin_contextmenu_folder.instance;
		if (instance && instance.is_plugin_active()) {
			instance.mbox_list_context_menu(menu);
			instance.mesg_list_context_menu(menu);
		}
	});

}
