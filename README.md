teriaki
=======

Watches & syncs folders into a riak bucket.

Using it
--------

Just start up teriaki.js using node and put JSON files into the syncdir/ folder

    node teriaki.js
    echo '{"poop": "in"}' > syncdir/poopin.json

Caveats
-------

- Only put json into syncdir for now
- No error handling at all
- I want to make a proper npm package with a command out of this
- No recursive watching/caching/inotify (?)

