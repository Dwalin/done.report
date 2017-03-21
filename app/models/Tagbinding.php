<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Tagbinding extends Model
{
    public $id;
    public $task__id;
    public $tag__id;


    public function initialize() {
        $this->belongsTo("task__id", "Tasks", "id");
        $this->belongsTo("tag__id", "Tags", "id");
    }
}
