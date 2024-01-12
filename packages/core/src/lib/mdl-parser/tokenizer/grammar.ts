export default `
start
= (__ @(macro_grammar/declare_grammar/comment) __)+

macro_grammar
= reserved:macro_identifier __ name:identifier __ "=" __ definition:macro_definition {
	reserved = reserved.trim().toLowerCase();
	
	return {
		reserved,
		name,
		decorators: [{"key": "definition", "value": definition}],
		body: [],
	}
}

macro_identifier
= "Macro"i

macro_definition
= parameters:macro_parameters __ "=>" __ body:macro_expression {
	return "(" + parameters + ") => " + body;
}

macro_parameters
= "(" param_content:[^)]* ")" {
	return param_content.join("");
}

macro_expression
= "{" content:curly_brace_content "}" { 
	return content.trim().replace(/\\n|\\r|\\t/g, "").replace(/\\s+/g, " ");
}

curly_brace_content
= text:((double_curly / non_curly_brace_char)*) { return text.join(""); }

double_curly
= "{{" / "}}"

non_curly_brace_char
= [^{}]

declare_grammar
= reserved:identifier
__ name:identifier?
__ decorators:(@decorator_statement __)*
__ '{'
__ body:(@(key_value_pair/identifier) __)+
__ '}' {
	if (!Array.isArray(decorators)) {
		decorators = [decorators].filter(item => item)
	}

  reserved = reserved.trim().toLowerCase();

	return {
		reserved,
		name,
		decorators,
		body,
	}
}


decorator_statement
= '@' key:identifier
value:(
	__ bracket_start
	__ @decorator_inner
	__ bracket_end
)? {
  if (value === null) {
    value = '';
  }

	return {
		key,
		value,
	}
}

decorator_inner
= equivalent
/ attribute_assignment
/ literal_string
/ content:$(not_bracket_content / content_of_bracket)*
/ identifier

key_value_pair
= key:identifier
__ ':'
__ value:element symbols:(@symbol/array_symbol)*
__ decorators:(@decorator_statement __)*{
	if (!Array.isArray(decorators)) {
		decorators = [decorators].filter(item => item)
	}

	if (!Array.isArray(symbols)) {
		symbols = [symbols].filter(item => item)
	}

	return {
		key,
		value,
		symbols,
		decorators,
	}
}

symbol
= [!?]

array_symbol
= '[]'

attribute_assignment '屬性指定'
= key:identifier
__ ':'
__ value:(equivalent/literal_string/array) {
	return {
		key,
		value,
	}
}

equivalent '等式敘述'
= first:column_with_table __ '=' __ second:column_with_table {
	return \`$\{first} = $\{second}\`
}

column_with_table '資料表欄位'
= '"'? table:identifier '"'? dot '"'? column:identifier '"'? {
	return \`$\{table}.\${column}\`
}

comment
= comment_start comment:accepted_all {
	return {
		type: 'comment',
		comment: comment.trim(),
	}
}

comment_start
= '//' / '#'

content_of_bracket '括號內容'
= bracket_start
__ content:$(not_bracket_content / content_of_bracket)*
__ bracket_end {
	return content
}

not_bracket_content
= $(!bracket_start !bracket_end .)

bracket_start '括號開始'
= '('

bracket_end '括號結束'
= ')'

argument '函式參數'
= __ value:element {
	return value
}

dot
= '.'

array
= '['
__ head:element
__ tail:(__ ',' __ @element)*
__ ']' {
	return [
		head,
		...tail,
	];
}

element
= identifier/array/literal_string

literal_string
= literal_string_double_quote / literal_string_single_quote / literal_string_back_quote

literal_string_double_quote
= '"' str:[^"]* '"' {return str.join("")}

literal_string_single_quote
= "'" str:[^']* "'" {return str.join("")}

literal_string_back_quote
= "\`" str:[^\\\`]* "\`" {return str.join("")}

accepted_all
= [^\\n\\r]* {
	return text()
}

identifier '識別字'
= !("Macro"i) [a-zA-Z_0-9]+ {return text()}

_ '空白'
= whitespace+

__ '選填空白'
= whitespace*

whitespace
= [ \\t\\n\\r]`;
