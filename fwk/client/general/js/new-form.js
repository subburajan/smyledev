
var NewForm = (function() {

	var form, Args;

	function initForm() {
		var cfg = {
			postURL: Args.URI,
			dv_enabled: false,
			fields: Args.fields || [],
			id: "app",
			name: Args.title || "",
			fixed: true,
			beforeSave: Args.beforeSave || function(data, cb) {
				cb(data);
			}
		};
		
		form = new GeneralForm(cfg);
		Args.sets && form.addFieldSets(Args.sets);
		form.listenChainEvents();
		
		var sets = Args.sets;	
	}
	
	function initActions() {		
		$("#form_butt_submit").on("click", function() {
			form.save(Args.success || function(data, message) {
				$("#cnt_body").html(
					"<div class='succ-msg'>Successfully Submitted</div>"
				);
			});
		});
	}

	return {
		init: function(args) {
			Args = args;
			initForm();

			initActions();
		},

		getArgs: function() {
			return Args;
		}
	};

})();

