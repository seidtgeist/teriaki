teriaki
=======

Watches & syncs a folder recursively into a riak bucket.

Install
-------

teriaki should be installed globally (-g) and as root:

	sudo npm install teriaki -g

This way it’ll end up in your PATH with the right owner.

Syncing a folder
----------------

Just invoke teriaki

	teriaki syncdir/ bucket
    echo '{"foo": "bar"}' > syncdir/poopin.json
	echo 'foobar' > syncdir/poopin.txt
	cp foo.jpg syncdir/

