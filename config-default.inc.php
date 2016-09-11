<?php
		
// Plugin default configuration file.
// Override these entries in the global config file.
// User can change exposed entries form application settings ui.
$config = array();

// plugin logging for debugging
$config['plugin.contextmenu_folder.enable_logging'] = true;

// periodic background folder list refresh
$config['plugin.contextmenu_folder.enable_refresh'] = true;

// actiate plugin context popup menu on mail box list elemenets 
$config['plugin.contextmenu_folder.enable_folder_context_menu'] = true;

// actiate plugin control popup menu on mail box list footer tool box
$config['plugin.contextmenu_folder.enable_folder_control_menu'] = true;

// actiate 'create contact folder form email address' feature
$config['plugin.contextmenu_folder.enable_message_list_menu'] = true;

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_checkbox_list'] = array(
        'enable_logging', 
        'enable_refresh', 
        'enable_folder_context_menu', 
        'enable_folder_control_menu',
        'enable_message_list_menu',
);

// mail box types included in the 'active' category
$config['plugin.contextmenu_folder.filter_active'] = array(
        'unread', 
        'special', 
        'selected', 
        'transient', 
        'predefined',
);

// mail box types included in the 'favorite' category
$config['plugin.contextmenu_folder.filter_favorite'] = array(
        'special', 
        'selected', 
        'predefined',
);

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_select_list'] = array(
        'filter_active', 
        'filter_favorite', 
);

// list of mail boxes included in the 'predefined' filter type
$config['plugin.contextmenu_folder.predefined_list'] = array(
        'INBOX/Sort',
        'Sent/Sort',
);

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_area_list'] = array(
        'predefined_list',
);

// expiration time for auto reset of transient mail box collection, minutes
$config['plugin.contextmenu_folder.transient_expire_time'] = 100;

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_text_list'] = array(
        'transient_expire_time',
);

// determine how to obtain list of imap special folders
$config['plugin.contextmenu_folder.special_folder_source'] = 'config'; // config|storage

?>
