<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Comments extends Model
{
    public $id;
    public $link;
    public $created;
    public $modified;
    public $user_id;
    public $task_id;

    public function initialize()
    {
        $this->belongsTo("task_id", "Tasks", "id");
        $this->belongsTo("user_id", "Users", "id");
    }

}
