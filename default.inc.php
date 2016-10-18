<?php
		
// Plugin default configuration file.
// Override these entries in the global config file.
// Users can change exposed entries form the application settings ui.
$config = array();

// activate plugin features
$config['plugin.contextmenu_folder.activate_plugin'] = true;

// plugin logging for debugging
$config['plugin.contextmenu_folder.enable_logging'] = true;

// periodic background folder list refresh
$config['plugin.contextmenu_folder.enable_refresh'] = false; // TODO

// activate plugin context popup menu on mailbox list elemenets 
$config['plugin.contextmenu_folder.enable_folder_list_context_menu'] = true;

// activate plugin control popup menu on mailbox list footer tool box
$config['plugin.contextmenu_folder.enable_folder_list_control_menu'] = true;

// activate 'create contact folder form email address' feature
$config['plugin.contextmenu_folder.enable_message_list_context_menu'] = true;

// plugin ui icon classes, choose from assets/fontello
$config['plugin.contextmenu_folder.icon_mapa'] = array(
        'show_all' => 'folder-icon-globe-earth',
        'show_active' => 'folder-icon-wifi-bold',
        'show_favorite' => 'folder-icon-heart-black',
        'folder_select' => 'folder-icon-thumbs-up-1',
        'folder_unselect' => 'folder-icon-thumbs-down-1',
        // 'folder_clean' => 'folder-icon-trash-wire',
        'folder_create' => 'folder-icon-folder-plus',
        'folder_delete' => 'folder-icon-folder-minus',
        'folder_rename' => 'folder-icon-pencil-tip',
        'folder_locate' => 'folder-icon-search-large',
        'folder_purge' => 'folder-icon-trash-can-iso',
        'folder_read_tree' => 'folder-icon-check-heavy',
        'reset_selected' => 'folder-icon-right-hand',
        'reset_transient' => 'folder-icon-hour-white',
        'mark_selected' => 'folder-mark-upper-left folder-icon-heart-white',
        'mark_transient' => 'folder-mark-lower-left folder-icon-hour-white',
);

// XXX no override
// avilable mailbox filter options
$filter_selector_list = array(
        'unread', // this filter finds mailboxes with unread messages
        'special', // will include special imap folders: [inbox, drafts, sent, junk, trash]
        'selected', // represents folder collection which can be selected/unselected into by the user
        'transient', // based on automatic folder collection, which tracks created/deleted/renamed mailboxes
        'predefined', // static user-defined list of mailbox folders, which is more "permanent" then 'selected'
);

// mailbox types included in the 'active' category
$config['plugin.contextmenu_folder.filter_active'] = array(
        'unread',
        'special',
        'selected', 
        'transient', 
        'predefined', 
);

// available select/options
$config['plugin.contextmenu_folder.filter_active.list'] = $filter_selector_list;

// mailbox types included in the 'favorite' category
$config['plugin.contextmenu_folder.filter_favorite'] = array(
        'special', 
        'selected', 
        'predefined',
);

// available select/options
$config['plugin.contextmenu_folder.filter_favorite.list'] = $filter_selector_list;

// list of mailboxes included in the 'predefined' filter type
$config['plugin.contextmenu_folder.predefined_list'] = array(
        'INBOX/Sort',
        'Sent/Sort',
);

// expiration time for auto remove of transient mailbox collection, minutes
$config['plugin.contextmenu_folder.transient_expire_mins'] = 20;

// current filter
$config['plugin.contextmenu_folder.show_mode'] = 'show_all';

// client ui state 
$config['plugin.contextmenu_folder.memento_current_mailbox'] = 'INBOX';
$config['plugin.contextmenu_folder.memento_current_message'] = '0';
$config['plugin.contextmenu_folder.memento_folder_locate_text'] = 'mbox name';
$config['plugin.contextmenu_folder.memento_contact_parent_item'] = '0';
$config['plugin.contextmenu_folder.memento_contact_header_item'] = '0';
$config['plugin.contextmenu_folder.memento_contact_format_item'] = '0';

// enabled client ui behaviour
$config['plugin.contextmenu_folder.feature_choice'] = array(
        'remember_filter',
        'remember_mailbox',
        'remember_message',
        'track_on_create',
        'track_on_delete',
        'track_on_rename', 
        'track_on_locate',
        'filter_on_mbox_mark_read',
        'render_selected',
        'render_transient',
        'replace_menu_purge',
        // 'allow_purge_any',
        // 'allow_purge_junk',
        'allow_purge_trash',
        // 'allow_purge_regex',
        // 'hide_menu_link',
        // 'hide_ctrl_menu',
        // 'hide_mbox_menu',
        // 'hide_mesg_menu',
        'expire_transient',
        'filter_on_expire_transient',
        'footer_contextmenu',
);

// available select/options
$config['plugin.contextmenu_folder.feature_choice.list'] = array(
        'remember_filter', // restore filter on session load
        'remember_mailbox', // restore last selected mailbox
        'remember_message', // restore last selected message
        'track_on_create', // track mailbox create in transient collection
        'track_on_delete', // track mailbox delete in transient collection
        'track_on_rename', // track mailbox rename in transient collection
        'track_on_locate', // track mailbox locate in transient collection
        'filter_on_mbox_mark_read', // apply filter after mark read of mbox or tree
        'render_selected', // display 'mark_selected' icon on mailbox
        'render_transient', // display 'mark_transient' icon on mailbox
        'replace_menu_purge', // override 'empty/purge' context menu command
        'allow_purge_any', // permit to discard messages from any folder
        'allow_purge_junk', // permit to discard messages only form 'junk'
        'allow_purge_trash', // permit to discard messages only form 'trash'
        'allow_purge_regex', // permit to discard messages matched with regex
        'hide_menu_link', // remove default mailbox list footer button
        'hide_ctrl_menu', // remove mailbox control menu items matched by selector
        'hide_mbox_menu', // remove mailbox context menu items matched by selector
        'hide_mesg_menu', // remove message context menu items matched by selector
        'expire_transient', // auto remove mailbox from transient collection 
        'filter_on_expire_transient', // apply filter after transient mailbox expiration
        'footer_contextmenu', // enable mouse 'contextmenu' for all mbox list footer buttons
);

// permit to discard messages matched with regex
$config['plugin.contextmenu_folder.allow_purge_regex'] = '^Archive/Discard/.*$';

// remove mailbox control menu items matched by selector, enabled by feature_choice:hide_ctrl_menu
$config['plugin.contextmenu_folder.hide_ctrl_menu_list'] = array(
        'div[id="rcm_plugin.contextmenu_folder.status_menu"] li:has(a[class*="folder_locate"])', // remove folder locate
);

// remove mailbox context menu items matched by selector, enabled by feature_choice:hide_mbox_menu
$config['plugin.contextmenu_folder.hide_mbox_menu_list'] = array(
        'div[id="rcm_folderlist"] li:has(a[class*="cmd_expunge"])', // remove mailbox compact
        'div[id="rcm_folderlist"] li:has(a[class*="collapseall"])', // remove mailbox collapse
        'div[id="rcm_folderlist"] li:has(a[class*="expandall"])', // remove mailbox expand
);

// remove message context menu items matched by selector, enabled by feature_choice:hide_mesg_menu
$config['plugin.contextmenu_folder.hide_mesg_menu_list'] = array(
        'div[id="rcm_messagemenu-menu"] li:has(a[class*="cmd_copy"])', // remove message copy via folder menu
        'div[id="rcm_messagemenu-menu"] li:has(a[class*="cmd_move"])', // remove message move via folder menu
);

// templates for making contact folder derived from mail headers
$config['plugin.contextmenu_folder.contact_folder_format_list'] = array(
        
        '{parent}/{full_name} @{domain}',
        '{parent}/{full_name} {mail_addr}',
        
        '{parent}/{full_name} [{subject}] @{domain}',
        '{parent}/{full_name} [{subject}] {mail_addr}',
        
        '{parent}/{company} @{domain}',
        '{parent}/{company} {mail_addr}',

        '{parent}/{company} [{subject}] @{domain}',
        '{parent}/{company} [{subject}] {mail_addr}',

        '{parent}/{company}/{full_name} @{domain}',
        '{parent}/{company}/{full_name} {mail_addr}',
        
        '{parent}/{company}/{full_name} [{subject}] @{domain}',
        '{parent}/{company}/{full_name} [{subject}] {mail_addr}',
        
        '{parent}/{company}/{company} @{domain}',
        '{parent}/{company}/{company} {mail_addr}',
        
        '{parent}/{company}/{company} [{subject}] @{domain}',
        '{parent}/{company}/{company} [{subject}] {mail_addr}',
        
        '{parent}/{company}/{company} {full_name} @{domain}',
        '{parent}/{company}/{company} {full_name} {mail_addr}',
        
        '{parent}/{company}/{company} {full_name} [{subject}] @{domain}',
        '{parent}/{company}/{company} {full_name} [{subject}] {mail_addr}',
        
);

// top level domain list 
$config['plugin.contextmenu_folder.domain_generic_list'] = array(
"biz","com","coop","edu","gov","mil","net","org",
);

// top level domain list 
$config['plugin.contextmenu_folder.domain_country_list'] = array(
"ac","ad","ae","af","ag","ai","al","am","an","ao","aq","ar","as","at","au","aw",
"az","ba","bb","bd","be","bf","bg","bh","bi","bj","bm","bn","bo","br","bs","bt","bv","bw","by","bz","ca",
"cc","cd","cf","cg","ch","ci","ck","cl","cm","cn","co","cr","cs","cu","cv","cx","cy","cz","de","dj","dk","dm",
"do","dz","ec","ee","eg","eh","er","es","et","eu","fi","fj","fk","fm","fo","fr","ga","gb","gd","ge","gf","gg","gh",
"gi","gl","gm","gn","gp","gq","gr","gs","gt","gu","gw","gy","hk","hm","hn","hr","ht","hu","id","ie","il","im",
"in","io","iq","ir","is","it","je","jm","jo","jp","ke","kg","kh","ki","km","kn","kp","kr","kw","ky","kz","la","lb",
"lc","li","lk","lr","ls","lt","lu","lv","ly","ma","mc","md","mg","mh","mk","ml","mm","mn","mo","mp","mq",
"mr","ms","mt","mu","mv","mw","mx","my","mz","na","nc","ne","nf","ng","ni","nl","no","np","nr","nu",
"nz","om","pa","pe","pf","pg","ph","pk","pl","pm","pn","pr","ps","pt","pw","py","qa","re","ro","ru","rw",
"sa","sb","sc","sd","se","sg","sh","si","sj","sk","sl","sm","sn","so","sr","st","su","sv","sy","sz","tc","td","tf",
"tg","th","tj","tk","tm","tn","to","tp","tr","tt","tv","tw","tz","ua","ug","uk","um","us","uy","uz", "va","vc",
"ve","vg","vi","vn","vu","wf","ws","ye","yt","yu","za","zm","zr","zw",
);

//////// settings

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_checkbox_list'] = array(
        'activate_plugin',
        'enable_logging', 
        // 'enable_refresh', // TODO 
        'enable_folder_list_context_menu', 
        'enable_folder_list_control_menu',
        'enable_message_list_context_menu',
);

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_select_list'] = array(
        'feature_choice',
        'filter_active', 
        'filter_favorite', 
);

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_area_list'] = array(
        'predefined_list',
        'contact_folder_format_list',
        // 'domain_generic_list',
        // 'domain_country_list',
        // 'hide_ctrl_menu_list',
        // 'hide_mbox_menu_list',
        // 'hide_mesg_menu_list',
);

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_text_list'] = array(
       'transient_expire_mins',
);

?>
