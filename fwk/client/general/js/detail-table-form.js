
var DetailTableForm = (function() {

	var forms = {}, Args;

	return {
		init: function(args) {
			DetailForm.init(args);
			Args = args;
			
			var arr = args.tableForms;
			
			$.each(arr, function(i, tf_args) {
				var id = tf_args.id;
				tf_args.jq.tableid = id + "_table";
				if(tf_args.manage) {
					tf_args.manage.id_prfx = id + "_";					
				} else {
					tf_args.manage = { fields: [ ] };
					tf_args.nomanage = true;
				}

				tf_args.nosearch = true;
				forms[tf_args.id] = _TableForm(tf_args);
			});
			
			return this;
		},
		
		getArgs: function() {
			return Args;
		},
		
		cancelForm: function() {
			DetailForm.cancelForm();
		},
		
		getDetailForm: function() {
			return DetailForm.getForm();
		},
		
		setMsg: function(isErr, msg) {
			this.getDetailForm().setMsg(isErr, msg);
		},
		
		getTableForm: function(id) {
			var form;
			if(id) {
				form = forms[id].getForm();
			}
			if(form) {
				return form;
			}
			for(var k in forms) {
				return forms[k].getForm();
			}
		}	
	};

})();

