<?php
//namespace RestApi\Api\Models;
use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Message;

class States extends Model {

    public $id;
    public $name;

    public function initialize() {

        $this->hasMany(
            "id",
            "Tasks",
            "state"
        );

    }
}