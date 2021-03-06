/* #declare require, module, process, Date, Math; */     

var base62 = require('./base62');

/*

IDs are generated thusly:

- 1 base62 digit to distinguish this machine (for clustering)
- 3 base62 digits corresponding to the process id (PID)
- 8 base62 digits corresponding to the number of quarter seconds since 2011-08-01 times 62^2
  calculated when the first ID is generated (not for every ID)

The last 8 digits is incremented by one every time an ID is requested.

This means that a process can generate 3844 IDs per quarter second without ever risking
repeats. Furthermore, collision could only occur if the process generated more than
3844 IDs in a quarter second, stopped, and then restarted with the same PID.

A more significant danger of repeat IDs could come from very large clock adjustments,
so it is important that the machine's clock be kept fairly accurate. (This potential problem
is also significantly mitigated by the PID prefix.)

*/

module.exports = IdGen;

function IdGen(prefix) { var self = this;
	self.prefix = prefix + base62.toBase62(process.pid, 3);
}

IdGen.prototype = {
	initLastIdInt: function () { var self = this;
		var epoch = new Date(2011, 7, 1).getTime();
		var quarterSecondsSince = Math.floor((new Date().getTime() - epoch) / 250);
		self.lastIdInt = base62.fromBase62(base62.toBase62(quarterSecondsSince, 6) + '00');
	},
	
	next: function () { var self = this;
		if (!self.lastIdInt) {
			self.initLastIdInt();
		}
		self.lastIdInt += 1;
		return self.prefix + base62.toBase62(self.lastIdInt, 8);
	}
};
