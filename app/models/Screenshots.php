<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Screenshots extends Model
{
    public $id;
    public $link;
    public $task_id;

    public function initialize()
    {
        $this->belongsTo("task_id", "Tasks", "id");

    }

}
