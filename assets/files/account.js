// Copyright Jesse Andrews, 2005-2010
// http://overstimulate.com
//
// This file may be used under the terms of of the
// GNU General Public License Version 2 or later (the "GPL"),
// http://www.gnu.org/licenses/gpl.html
//
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.

function setkeys() {
	$('#account').show();
}

function s3Control() {
	$('#updateCredentials').click(function() {
		$.blockUI($('#credentials'));

		return false;
	});

	function addBucket(bucket) {
		var tr = document.createElement('tr');
		tr.setAttribute('key', bucket);
		var td = document.createElement('td');
		var a = document.createElement('a');
		a.appendChild(document.createTextNode(bucket));
		a.setAttribute("href", "browse.html?" + encodeURIComponent(bucket));
		td.appendChild(a);
		tr.appendChild(td);
		$(tr).append("<td width='20'><a class='del' onclick='delete_bucket($(this).closest(\"TR\"))'><img src='assets/images/delete.png' title='Delete' /></a></a>");

		$('#buckets').append(tr);
	}

	function list() {
		$('#active').show();
		$('#active').addClass('busy');
		$('#buckets').hide().empty();

		S3Ajax.listBuckets(function(xml, objs) {
			if ( xml.responseXML == null )
				humanMsg.displayMsg('Missing or invalid S3 credientials');
			else
			{
				var buckets = xml.responseXML.getElementsByTagName('Bucket');
				for (var i = 0; i < buckets.length; i++) {
					addBucket(buckets[i].getElementsByTagName('Name')[0].textContent);
				}
			}
			$('#buckets').show();
			// $('#createBucket').animate({opacity: 'show'});
			$('#active').removeClass('busy');
		}, function(req) {
			humanMsg.displayMsg(req.responseXML.getElementsByTagName('Message')[0].childNodes[0].textContent);
			$('#active').removeClass('busy');
		});
	}

	function load() {
		try {
			var creds = s3_auth.get();
			S3Ajax.KEY_ID = creds.key;
			S3Ajax.SECRET_KEY = creds.secret;
			if ( !decodeURIComponent(window.location.search.slice(1)).length )
				list();
		} catch (e) {
			console.log("error", e)
		};
	}

	this.save = function() {
		function trim(val) {
			if (val) {
				return val.replace(/^\s+|\s+$/g, '');
			}
		}

		var key = trim($('#s3-key').val());
		var secret = trim($('#s3-secret-key').val());

		if (key && key.length > 0) {
			s3_auth.set(key, secret);
		} else {
			s3_auth.clear();
		}

		window.location = window.location.href;
	};

	var creds = s3_auth.get();

	if (creds) {
		$('#s3-key').val(creds.key);
		$('#s3-secret-key').val(creds.secret);
	}

	load();
}

function add_bucket()
{
	var bucket_name = prompt("Enter your new bucket name", "");
	if (bucket_name != null && bucket_name != "")
	{
		S3Ajax.createBucket(bucket_name, function() {
			window.location.reload();
		}, function(req) {
			humanMsg.displayMsg('<strong>' + bucket + '</strong>: ' + req.responseXML.getElementsByTagName('Message')[0].childNodes[0].textContent);
		});
	}

	return false;
}

function delete_bucket( $TR )
{
	var key = $TR.attr('key');
	if (confirm('Are you sure you want to delete:\n' + key)) {
		S3Ajax.deleteBucket(key, function() {
			$TR.remove();
		}, function(req) {
			humanMsg.displayMsg('<strong>' + key + '</strong>: ' + req.responseXML.getElementsByTagName('Message')[0].childNodes[0].textContent);
		});
	}
}

$(function() {
	s3_controller = new s3Control();
});