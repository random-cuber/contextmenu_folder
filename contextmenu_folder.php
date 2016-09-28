<?php

// Plugin: contextmenu_folder
// Roundcube Context Menu Folder Manager
// Adds context menus with mailbox operations
class contextmenu_folder extends rcube_plugin {

    private static $filter_type_list = array('unread', 'special', 'selected', 'transient', 'predefined');

    const ROOT = ''; // root of mail box hierarchy

    public $task = 'mail|settings'; // supported tasks regex filter
    public $allowed_prefs = array(); // see: rcube_plugin->$allowed_prefs

    private $config_default = array(); // default plugin configuration
    private $rc; // controller singleton

    // early instace init
    function onload() {
        $this->provide_allowed_prefs();
    }

    // final instace init
    function init() {
        $this->rc = rcmail::get_instance();
        $this->require_plugin('jqueryui');
        $this->require_plugin('contextmenu');
        $task = $this->rc->task; $action = $this->rc->action;
        if ($task == 'mail' && $this->is_plugin_action($action)) {
            // keep order
            $this->provide_config_default();
            $this->init_mail_hook();
            $this->init_mail_action();
            $this->provide_collect_special();
            $this->provide_collect_predefined();
            $this->init_mail_html_page();
        }
        if ($task == 'settings') {
            // keep order
            $this->provide_config_default();
            $this->init_settings_hook();
            $this->init_settings_html_page();
        }
    }
    
    ////////////////////////////
    
    // plugin name space
    function key($name) {
        return 'plugin.contextmenu_folder.' . $name; // keep in sync with *.js
    }

    // plugin server logger
    function log($line, $force = false) {
        if($this->config_get('enable_logging') || $force){
            $file = $this->key('log');
            $func = debug_backtrace()[1]['function'];
            $text = $func . ' : ' . $line;
            rcube::write_log($file, $text);
        }
    }

    // localized quoted text
    function quoted($name) {
        return rcube::Q($this->gettext($name));
    }

    // load plugin preferences
    function config_get($name) {
        $key = $this->key($name); 
        return $this->rc->config->get($key);
    }
    
    // save plugin preferences
    function config_put($name, $value) {
        $key = $this->key($name);
        $this->rc->user->save_prefs(array($key => $value));
    }
    
    // read client post result
    function input_value($name) {
        $name = str_replace('.', '_', $name); // PHP convention
        return rcube_utils::get_input_value($name, rcube_utils::INPUT_POST);
    }
    
    // imap backend storage mail box separator 
    function hierarchy_delimiter() {
        return $this->rc->storage->get_hierarchy_delimiter();
    }
    
    // load plugin default configuration file
    function provide_config_default($name = 'default.inc.php') {
        $config = null;
        $path = $this->home . '/' . $name;
        if ($path && is_file($path) && is_readable($path)) {
            ob_start();
            include($path);
            ob_end_clean();
        }
        if (is_array($config)) {
            $this->config_default = $config;
        }
    }
    
    ////////////////////////////
    
    // allow to save these prefs on demand
    function provide_allowed_prefs() {
        $this->allowed_prefs = array(
            $this->key('show_mode'),
            $this->key('collect_special'),
            $this->key('collect_selected'),
            $this->key('collect_transient'),
            $this->key('collect_predefined'),
            $this->key('contact_folder_parent_item'),
            $this->key('contact_folder_header_item'),
            $this->key('contact_folder_format_item'),
        );
    }
    
    // match action prefix to plugin name space
    function is_plugin_action($action) {
        return $action == '' || $action == 'refresh' || 0 === strpos($action, $this->key(''));
    }
    
    // mail
    function init_mail_hook() {
        $this->add_hook('refresh', array($this, 'hook_refresh'));
        $this->add_hook('config_get', array($this, 'hook_config_get'));
        $this->add_hook('new_messages', array($this, 'hook_new_messages'));
        $this->add_hook('render_mailboxlist', array($this, 'hook_render_mailboxlist'));
    }
    
    // mail
    function init_mail_action() {
        $this->register_action($this->key('show_mode'), array($this, 'action_show_mode'));
        $this->register_action($this->key('collect_list'), array($this, 'action_collect_list'));
        $this->register_action($this->key('collect_reset'), array($this, 'action_collect_reset'));
        $this->register_action($this->key('header_list'), array($this, 'action_header_list'));
        $this->register_action($this->key('folder_list'), array($this, 'action_folder_list'));
        $this->register_action($this->key('folder_create'), array($this, 'action_folder_create'));
        $this->register_action($this->key('folder_delete'), array($this, 'action_folder_delete'));
        $this->register_action($this->key('folder_locate'), array($this, 'action_folder_locate'));
        $this->register_action($this->key('folder_rename'), array($this, 'action_folder_rename'));
        $this->register_action($this->key('folder_select'), array($this, 'action_folder_select'));
        $this->register_action($this->key('folder_tree_read'), array($this, 'action_folder_tree_read'));
    }

    // mail
    function init_mail_html_page() {
        $output = $this->rc->output;
        if ($output->type == 'html') {
            $this->add_texts('localization', true);
            $this->include_script('contextmenu_folder.js');
            $this->include_stylesheet( 'skins' . '/style.css');
            $this->include_stylesheet($this->local_skin_path() . '/style.css');
            $this->include_stylesheet( 'assets/fontello/css/folder.css');

            $this->provide_client_env_var();
        }
    }
    
    // client environment variables
    function set_env($name, $value = null) {
        $key = $this->key($name);
        if(! isset($value)) {
            $value = $this->config_get($name);
        }
        $this->rc->output->set_env($key, $value);
    }
    
    // client environment variables
    function provide_client_env_var() {
        $name_list = array(
            'activate_plugin',
            'show_mode', 
            'enable_logging', 
            'enable_refresh', 
            'enable_client_filter',
            'enable_folder_list_context_menu', 
            'enable_folder_list_control_menu', 
            'enable_message_list_context_menu', 
            'contact_folder_parent_item', 
            'contact_folder_header_item', 
            'contact_folder_format_item', 
            'contact_folder_format_list', 
            'filter_active',
            'filter_favorite',
            'collect_special',
            'collect_selected',
            'collect_transient',
            'collect_predefined',
            'icon_class_selected',
        );
        foreach($name_list as $name) {
           $this->set_env($name);
        }
    }
    
    function is_client_filter(){
        return $this->config_get('enable_client_filter');
    }

    // build list of imap special mail box names
    function special_folder_list() {
        $storage = $this->rc->get_storage();
        $this->log('$storage: ' . print_r($storage, true));
        $special_folders = $storage->get_special_folders();
        $folder_list = array_merge(
            array('inbox' => 'INBOX'), $special_folders 
        );
        return $folder_list;
    }
    
    // 
    function provide_collect_special() {
        $mbox_list = $this->special_folder_list();
        $this->config_put('collect_special', array());
        foreach($mbox_list as $mbox) {
            $this->folder_collect_set('collect_special', $mbox);
        }
    }
    
    // rebuild predefined mail box collection from the configuration
    function provide_collect_predefined() {
        $mbox_list = $this->config_get('predefined_list');
        $this->log('$mbox_list: ' . print_r($mbox_list, true));
        $this->config_put('collect_predefined', array());
        foreach($mbox_list as $mbox) {
            $this->folder_collect_set('collect_predefined', $mbox);
        }
    }

    // navigate mailbox hierarchy
    function parent_mbox($mbox) {
        $delimiter = $this->hierarchy_delimiter();
        if (strpos($mbox, $delimiter) === false) {
              return self::ROOT;
        } else {
              return substr($mbox, 0, strrpos($mbox, $delimiter));
        }
    }
    
    // detect imap special mail box name
    function is_folder_special($name) {
        return $this->rc->storage->is_special_folder($name);
    }
    
    // store mail box in selected collection
    function folder_selected_set($mbox) {
        $this->folder_collect_set('collect_selected', $mbox);
    }
    
    // remove mail box from selected collection
    function folder_selected_unset($mbox) {
        $this->folder_collect_unset('collect_selected', $mbox);
    }
    
    // remove all mail box entries from selected collection
    function folder_selected_reset() {
        $this->config_put('collect_selected', array());
    }
    
    // store mail box in transient collection
    function folder_transient_set($mbox) {
        $this->folder_collect_set('collect_transient', $mbox);
    }
    
    // remove mail box from transient collection
    function folder_transient_unset($mbox) {
        $this->folder_collect_unset('collect_transient', $mbox);
    }
    
    // remove all mail box entries from transient collection
    function folder_transient_reset() {
        $this->config_put('collect_transient', array());
    }
    
    // detect if mail box is stored in the collection
    function is_folder_collect($collect, $mbox) {
        $folder_list = $this->config_get($collect);
        return isset($folder_list[$mbox]);
    }
    
    // add mail box and its parents to the collection
    function folder_collect_set($collect, $mbox) {
        if( $mbox == self::ROOT ) {
            return;
        } else {
            $this->log($collect . ' : ' . $mbox);
            $folder_list = $this->config_get($collect);
            $folder_list[$mbox] = $mbox;
            $this->config_put($collect, $folder_list);
            $this->folder_collect_set($collect, $this->parent_mbox($mbox));
        }
    }
    
    // remove mail box from the given collection
    function folder_collect_unset($collect, $mbox) {
        if( $mbox == self::ROOT ) {
            return;
        } else {
            $this->log($collect . ' : ' . $mbox);
            $folder_list = $this->config_get($collect);
            unset($folder_list[$mbox]);
            $this->config_put($collect, $folder_list);
        }
    }
    
    // find nubmer of unread messages in the mail box
    function folder_count_unread($mbox) {
        $mode = 'UNSEEN'; $force = true; $status = true;
        return $this->rc->storage->count($mbox, $mode, $force, $status);
    }
    
    // build mail box filter flags from configuration
    function provide_filter($name) {
        $filter = array(); // $filter[type] = true|false
        $filter_keys = $this->config_get($name);
        foreach(self::$filter_type_list as $type) {
              $filter[$type] = in_array($type, $filter_keys);
        }
        return $filter;
    }
    
    // recursively apply mail box filter
    function mailbox_filter_apply(& $filter, & $folder_list, & $index, & $folder) {
        $mbox = $folder['id']; // full path
        $name = $folder['name']; // base name
        $folder_list_next = & $folder['folders']; // nested entries
        $count = 0; // propagate cumulative flags from child to parent
        if($filter['unread']) {
            $count += $this->folder_count_unread($mbox) ;
        }
        foreach($folder_list_next as $index_next => & $folder_next) {
            $count += $this->mailbox_filter_apply($filter, $folder_list_next, $index_next, $folder_next);
        }
        $apply = $count > 0 || // mail box retention criteria
            ( $filter['special'] && $this->is_folder_special($name) ) ||
            ( $filter['selected'] && $this->is_folder_collect('collect_selected', $mbox) ) ||
            ( $filter['transient'] && $this->is_folder_collect('collect_transient', $mbox) ) ||
            ( $filter['predefined'] && $this->is_folder_collect('collect_predefined', $mbox) ) ||
            false;
        if( ! $apply ) {
            unset($folder_list[$index]); 
        }
        return $count;
    }
    
    // apply mail box filter for 'active' category
    function mailboxlist_filter_active(& $args) {
        $filter = $this->provide_filter('filter_active');
        $folder_list = & $args['list'];
        foreach($folder_list as $index => & $folder) {
              $this->mailbox_filter_apply($filter, $folder_list, $index, $folder);
        }
        return $args;
    }

    // apply mail box filter for 'favorite' category
    function mailboxlist_filter_favorite(& $args) {
        $filter = $this->provide_filter('filter_favorite');
        $folder_list = & $args['list'];
        foreach($folder_list as $index => & $folder) {
              $this->mailbox_filter_apply($filter, $folder_list, $index, $folder);
        }
        return $args;
    }

    // periodic folder tree refresh 
    function hook_refresh($args) {
        if($this->config_get('enable_refresh')) {
            $this->log('TODO ');
            // $this->action_folder_list();
        }
        return $args;
    }
    
    // inject plugin default configuration
    function hook_config_get($args){
        $name = $args['name'];
        $result = $args['result'];
        $default = $this->config_default[$name];
        if(! isset($result) && isset($default)) {
            $args['result'] = $default;
        }
        return $args;
    }
    
    function hook_new_messages($args){
        return $args;
    }

    // provide filtered mail box view
    function hook_render_mailboxlist($args) {
        if( $this->is_client_filter() ) {
            return $args;
        }
        
        $show_mode = $this->config_get('show_mode');
        switch($show_mode){
        case 'show_all':
            return $args;
        case 'show_active':
            return $this->mailboxlist_filter_active($args);
        case 'show_favorite':
            return $this->mailboxlist_filter_favorite($args);
        default:
            $this->log('invalid $show_mode: ' . $show_mode, true);
            return $args;
        }
    }
    
    // change current mail box in the ui
    function select_folder($name) {
        $output = $this->rc->output;
        if( $this->is_client_filter()) {
            
        } else {
            $location = '?' . '_task=mail' . '&' . '_mbox=' . urlencode($name);
            $output->command('redirect', $location);
        }
        $output->send();
    }

    // change mail box view filter settings
    public function action_show_mode() {
        $name = 'show_mode';
        $mode_last = $this->config_get($name);
        $mode_next = $this->input_value($name);
        switch($mode_next){
        case 'show_all':
        case 'show_active':
        case 'show_favorite':
            $this->config_put($name, $mode_next);
            break;
        default:
            $this->log('invalid $show_mode: ' . $mode_next, true);
            break;
        }
        $target = $this->input_value('target');
        $this->select_folder($target);
    }
  
    // produce flat sorted mail box list from the collection
    public function action_collect_list() {
        $collect = $this->input_value('collect');
        $folder_list = $this->config_get($collect); sort($folder_list); // FIXME
        $output = $this->rc->output;
        $output->command($this->key('collect_list'), array('folder_list' => $folder_list));
        $output->send();
    }
    
    // reset collection content
    public function action_collect_reset() {
        $collect = $this->input_value('collect');
        switch($collect){
        case 'selected':
            $this->folder_selected_reset();
            break;
        case 'transient':
            $this->folder_transient_reset();
            break;
        default:
            $this->log('invalid $collect: ' . $mode_next, true);
            break;
        }
        $target = $this->input_value('target');
        $this->select_folder($target);
    }

    // manage mail box membership in the 'selected' collection
    public function action_folder_select() {
        $mode = $this->input_value('mode');
        $target = $this->input_value('target');
        
        switch($mode){
        case 'folder_select':
            $this->folder_selected_set($target);
            break;
        case 'folder_unselect':
            $this->folder_selected_unset($target);
            break;
        default:
            $this->log('invalid $mode: ' . $mode, true);
            return;
        }
    }
    
    // create complete folder tree, bottom up
    function folder_ensure_tree($target) {
        $storage = $this->rc->storage;
        if($storage->folder_exists($target)) {
            return true;
        }
        $parent = $this->parent_mbox($target);
        if($parent == self::ROOT || $storage->folder_exists($parent)) {
            return $storage->create_folder($target, true);
        }
        return $this->folder_ensure_tree($parent) && $storage->create_folder($target, true); // recurse
    }
    
    // report back to client the change
    function folder_update($action, $source, $target) {
        $output = $this->rc->output;
        if( $this->is_client_filter()) {
            $output->command($this->key('folder_update'), array(
                'action' => $action,
                'source' => $source,
                'target' => $target,
            ));
        }
        $output->send();
    }

    // create imap mail box and switch ui to result
    public function action_folder_create() {
        $output = $this->rc->output;
        $storage = $this->rc->storage;
          
        $source = '';
        $target = $this->input_value('target');
        $result = $this->folder_ensure_tree($target);
        if ($result) {
            $this->folder_transient_set($target);
            $this->folder_update('create', $source, $target);
            $this->select_folder($target);
        } else {
            $this->rc->display_server_error('error folder_create');
        }
    }

    // delete imap mail box and switch ui to parent
    public function action_folder_delete() {
        $output = $this->rc->output;
        $storage = $this->rc->storage;
          
        $source = '';
        $target = $this->input_value('target');
        $result = $storage->delete_folder($target);
        if ($result) {
            $this->folder_transient_unset($target);
            $parent = $this->parent_mbox($target);
            if( $parent == self::ROOT ){
                $parent = 'INBOX';
            }
            $this->folder_update('delete', $source, $target);
            $this->select_folder($parent);
        } else {
            $this->rc->display_server_error('error folder_delete');
        }
    }

    // rename imap mail box and switch ui to result
    public function action_folder_rename() {
        $output = $this->rc->output;
        $storage = $this->rc->storage;
          
        $source = $this->input_value('source');
        $target = $this->input_value('target');
            $result = $storage->rename_folder($source, $target);
        if ($result) {
            $this->folder_transient_unset($source);
            $this->folder_transient_set($target);
            $this->folder_update('rename', $source, $target);
            $this->select_folder($target);
        } else {
            $this->rc->display_server_error('error folder_rename');
        }
    }

    // switch ui to provided mail box 
    public function action_folder_locate() {
        $target = $this->input_value('target');
        $this->folder_transient_set($target);
        $this->select_folder($target);
    }

    // produce flat, sorted, unfiltered, mail box list
    public function action_folder_list() {
        $output = $this->rc->output;
        $storage = $this->rc->storage;
        
        $folder_list = $storage->list_folders();
        $output->command($this->key('folder_list'), array('folder_list' => $folder_list));
        $output->send();
    }

    // mark all un-seen messages in the mail box as read
    function folder_mark_read($target) {
        $this->log($target);
        
        $output = $this->rc->output;
        $storage = $this->rc->storage;
        
        $search = $storage->search_once($target, 'ALL UNSEEN', true);
        if ($search->is_empty()){
            return;
        }
        $message_list = $search->get();
        $storage->set_flag($message_list, 'SEEN', $target);
        $output->command('toggle_read_status', 'read', $message_list);
        rcmail_send_unread_count($target, true);
    }

    // recursively navigate mail box and its descendats and mark all as read
    public function action_folder_tree_read() {
        $output = $this->rc->output;
        $storage = $this->rc->storage;
        
        $target = $this->input_value('target');
        $mark_mode = $this->input_value('mark_mode');
        
        $this->folder_mark_read($target);
        
        if($mark_mode == 'mark-tree') {
            $delimiter = $this->hierarchy_delimiter();
            $pattern = $target . $delimiter . '*';
            $folder_list = $storage->list_folders(self::ROOT, $pattern, 'mail', null, false);
            foreach($folder_list as $folder) {
                $this->folder_mark_read($folder);
            }
        }
        
        $output->send();
    }
    
    // guess business name from email domain
    function company_name($domain) {
        $generic_list = $this->config_get('domain_generic_list');
        $country_list = $this->config_get('domain_country_list');
        $domain = strtolower($domain);
        $company = explode(".", $domain);
        if (in_array(end($company), $generic_list)) {
            array_pop($company); 
            $company = end($company);
        } else if (in_array(end($company), $country_list)) {
            array_pop($company);
            if(in_array(end($company), $generic_list)) {
                array_pop($company);
            }
            $company = end($company);
        } else {
            $company = implode(" ", $company);
        }
        $company = ucwords($company);
        return $company;
    }

    // provide structured message address headers
    public function action_header_list(){
        $uid = $this->input_value('uid');
        $mbox = $this->input_value('mbox');
        $message = new rcube_message($uid, $mbox);
        $header_list = array();
        foreach(array('from', 'to', 'cc') as $type) {
            $header = $message->get_header($type);
            $subject = $message->get_header('subject');
            $address_list = rcube_mime::decode_address_list($header);
            foreach($address_list as $address) {
                $name = trim($address['name']);
                if (strpos($name, ",") === false) {
                    $full_part = explode(" ", $name);
                } else { // reverse names order
                    $temp = explode(",", $name);
                    $full_part = array(trim(end($temp)), trim(reset($temp)));
                }
                $full = implode(" ", $full_part); $full = ucwords($full); $full = trim($full);
                $mailto = strtolower($address['mailto']); $mailto_part = explode("@", $mailto);
                $prefix = reset($mailto_part); $domain = end($mailto_part);
                $company = $this->company_name($domain);
                $header_list[] = array(
                    'type' => $type, 'name' => $name, 'string' => $address['string'],
                    'full_name' => $full, 'full_head' => reset($full_part), 'full_tail' => end($full_part),
                    'mail_addr' => $mailto, 'prefix' => $prefix, 'domain' => $domain, 'company' => $company,
                    'subject' => $subject,
                );
            }
        }
        $this->log(print_r($header_list, true));
        $output = $this->rc->output;
        $output->command($this->key('header_list'), array('header_list' => $header_list));
        $output->send('plugin');
    }
    
    ////////////////////////////
    
    // settings
    function init_settings_hook() {
        $this->add_hook('config_get', array($this, 'hook_config_get'));
        $this->add_hook('preferences_list', array($this, 'hook_preferences_list'));
        $this->add_hook('preferences_save', array($this, 'hook_preferences_save'));
    }

    // settings
    function init_settings_html_page() {
        $output = $this->rc->output;
        if ($output->type == 'html') {
            $this->add_texts('localization', true);
        }
    }

    // plugin settings section
    function is_plugin_section($args) {
        return $args['section'] == 'mailbox';
    }
    
    // settings exposed to user
    function settings_checkbox_list() {
        return $this->config_get('settings_checkbox_list');
    }

    // settings exposed to user
    function settings_select_list() {
        return $this->config_get('settings_select_list');
    }

    // settings exposed to user
    function settings_area_list() {
        return $this->config_get('settings_area_list');
    }

    // settings checkbox
    function build_checkbox(& $entry, $name) {
        $key = $this->key($name);
        $checkbox = new html_checkbox(array(
             'id' => $key, 'name' => $key, 'value' => 1,
        ));
        $entry['options'][$name] = array(
            'title' => html::label($key, $this->quoted($name)),
            'content' => $checkbox->show($this->config_get($name)),
        );
    }

    // settings multi select
    function build_select(& $entry, $name, $option_list) {
        $key = $this->key($name);
        $select = new html_select(array(
             'id' => $key, 'name' => $key . '[]', // use array 
             'multiple' => true, 'size' => 5,
        ));
        $select->add($option_list, $option_list); // value => content
        $entry['options'][$name] = array(
            'title' => html::label($key, $this->quoted($name)),
            'content' => $select->show($this->config_get($name)),
        );
    }
    
    // settings multi line text area
    function build_textarea(& $entry, $name) {
        $key = $this->key($name);
        $textarea = new html_textarea(array(
             'id' => $key, 'name' => $key, 'rows' => 5, 'cols' => 65,
        ));
        $entry['options'][$name] = array(
            'title' => html::label($key, $this->quoted($name)),
            'content' => $textarea->show(implode(PHP_EOL, $this->config_get($name))),
        );
    }
    
    // build settings ui
    function hook_preferences_list($args) {
        if ($this->is_plugin_section($args)) {
            $blocks = & $args['blocks'];
            $section = $this->key('section');
            $blocks[$section] = array(); $entry = & $blocks[$section];
            $entry['name'] = $this->quoted('folder_menu');
            foreach($this->settings_checkbox_list() as $name) {
                $this->build_checkbox($entry, $name);
            }
            foreach($this->settings_select_list() as $name) {
                $this->build_select($entry, $name, self::$filter_type_list);
            }
            foreach($this->settings_area_list() as $name) {
                $this->build_textarea($entry, $name);
            }
        }
        return $args;
    }
    
    // settings checkbox
    function persist_checkbox(& $prefs, $name) {
        $key = $this->key($name); $value = $this->input_value($key);
        $prefs[$key] =  $value ? true : false;
    }
  
    // settings multi select
    function persist_select(& $prefs, $name) {
        $key = $this->key($name); $value = $this->input_value($key);
        $prefs[$key] = $value;
    }
  
    // settings multi line text area
    function persist_textarea(& $prefs, $name) {
        $key = $this->key($name); $value = $this->input_value($key);
        $value = explode(PHP_EOL, $value); // array from text
        $value = array_map('trim', $value); // no spaces
        $value = array_filter($value); // no empty lines
        // sort($value); // alpha sorted
        $prefs[$key] = $value;
    }
  
    // persist user settings
    function hook_preferences_save($args) {
        if ($this->is_plugin_section($args)) {
            $prefs = & $args['prefs'];
            $this->log('post: ' . print_r($_POST, true));
            foreach($this->settings_checkbox_list() as $name) {
                $this->persist_checkbox($prefs, $name);
            }
            foreach($this->settings_select_list() as $name) {
                $this->persist_select($prefs, $name);
            }
            foreach($this->settings_area_list() as $name) {
                $this->persist_textarea($prefs, $name);
            }
        }
        return $args;
    }

}

?>
