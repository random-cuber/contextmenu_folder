<?php
		
// Plugin default configuration file.
// Override these entries in the global config file.
// Users can change exposed entries form the application settings ui.
$config = array();

// plugin logging for debugging
$config['plugin.contextmenu_folder.enable_logging'] = false;

// periodic background folder list refresh
$config['plugin.contextmenu_folder.enable_refresh'] = false; // TODO

// actiate plugin context popup menu on mail box list elemenets 
$config['plugin.contextmenu_folder.enable_folder_list_context_menu'] = true;

// actiate plugin control popup menu on mail box list footer tool box
$config['plugin.contextmenu_folder.enable_folder_list_control_menu'] = true;

// actiate 'create contact folder form email address' feature
$config['plugin.contextmenu_folder.enable_message_list_context_menu'] = false; // TODO

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_checkbox_list'] = array(
        'enable_logging', 
        'enable_refresh', 
        'enable_folder_list_context_menu', 
        'enable_folder_list_control_menu',
        'enable_message_list_context_menu',
);

// mail box types included in the 'active' category
$config['plugin.contextmenu_folder.filter_active'] = array(
        'unread', // this filter finds mailboxes with unread messages
        'special', // will include special imap folders: [inbox, drafts, sent, junk, trash]
        'selected', // represents folder collection which can be selected/unselected into by the user
        'transient', // based on automatic folder collection, which tracks created/deleted/renamed mailboxes
        'predefined', // static user-defined list of mailbox folders, which is more "permanent" then selected
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
        'contact_folder_format_list',
);

// expiration time for auto reset of transient mail box collection, minutes
$config['plugin.contextmenu_folder.transient_expire_time'] = 100;

// expose these settings in user ui
$config['plugin.contextmenu_folder.settings_text_list'] = array(
        'transient_expire_time',
);

// determine how to obtain list of imap special folders
$config['plugin.contextmenu_folder.special_folder_source'] = 'config'; // config|storage

// last selected list entry 
$config['plugin.contextmenu_folder.contact_folder_parent_item'] = '0';
$config['plugin.contextmenu_folder.contact_folder_header_item'] = '0';
$config['plugin.contextmenu_folder.contact_folder_format_item'] = '0';

// rules for making contact folder derived from mail headers
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

?>
