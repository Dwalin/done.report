<?php

//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class Tasks extends Model
{
    public $id;
    public $task;
    public $description;
    public $deadline;
    public $ticket;
    public $time__spent;
    private $created;
    private $modified;

    public function initialize()
    {

        $this->hasManyToMany(
            "id",
            "Tagbinding",
            "task__id", "tag__id",
            "Tags",
            "id"
        );

        $this->hasManyToMany(
            "id",
            "Userbinding",
            "task_id", "user_id",
            "Users",
            "id"
        );

        $this->belongsTo(
            "state",
            "States",
            "id"
        );

        $this->hasMany(
            "id",
            "Userbinding",
            "task_id"
        );

        $this->hasMany(
            "id",
            "Screenshots",
            "task_id"
        );

        $this->hasMany(
            "id",
            "Comments",
            "task_id"
        );

    }


    public function beforeCreate() {
        // Установить дату создания
        $this->created = date('Y-m-d H:i:s');
        $this->modified = date('Y-m-d H:i:s');
    }

    public function beforeUpdate() {
        // Установить дату модификации
        $this->modified = date('Y-m-d H:i:s');
    }

}
