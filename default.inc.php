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
        // 'domain_generic_list',
        // 'domain_country_list',
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

?>
