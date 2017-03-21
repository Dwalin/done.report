<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Userbinding extends Model
{
    public $id;
    public $user_id;
    public $task_id;

    public function initialize() {
        $this->belongsTo("task_id", "Tasks", "id");
        $this->belongsTo("user_id", "Users", "id");
        $this->belongsTo("role_id", "Roles", "id");
    }


}
