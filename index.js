$(function() {
    // Jquery style component, that takes an input box, src url (whose data is fetched only once), options
    // to add a suggestions panel to any input box
    var Suggestions = function($searchbox, url, options) {

        var MAX_SUGGESTIONS = options.MAX_SUGGESTIONS;
        var products = [];
        var currentMatchesLength = 0;
        var currentHighlightedIndex = 0;

        //Create ul and add it as a sibling to the input box
        var suggestionsTemplate = getTemplate('suggestions');
        var html = suggestionsTemplate(Array(options.MAX_SUGGESTIONS).fill({}));
        $searchbox.after(html.replace(/[\u200B]/g, ''));
        var $suggestionsList = $(".suggestions-list");
        var $suggestionsNomatch = $suggestionsList.find(".suggestions-nomatch");
        var $suggestionsItems = $suggestionsList.find(".suggestions-item");

        $suggestionsItems
            .click(function(e) {
                navigate($(this).attr("url"));
            })
            .hover(
                function(){
                    $(this).addClass("highlighted");
                },
                function(){
                    $(this).removeClass("highlighted");
                }
            );

        //Get data for search and cache it
        $.getJSON(url, function(data) {
            products = data.products;
        });

        //Hook input box to trigger suggestions
        $searchbox.on("input", function(e) {
            var val = $(this)
		                .val()
		                .toLowerCase()
		                .trim();
            if (!val) {
                $suggestionsList.hide();
                return;
            }
            var currentMatches = products.filter(function(product, index) {
                var found = product.name.toLocaleLowerCase().search(val);
                return found >= 0;
            });

            currentMatchesLength = Math.min(currentMatches.length, options.MAX_SUGGESTIONS);
            if (currentMatchesLength > 0) {
                $suggestionsNomatch.hide();
                $suggestionsList.show();
            } else {
                $suggestionsNomatch
                    .show()
                    .css({display: "block"});;
            }
            $suggestionsList.find(".suggestions-item").each(function(index) {
                if (index < currentMatchesLength) { //make visible and change val
                    var name = currentMatches[index].name;
                    name = name.replace($searchbox.val(), ("<b>" + $searchbox.val() + "</b>"));
                    $(this)
                        .show()
                        .attr("url", currentMatches[index].url)
                        .css({display: "block"});
                    $(this)
                        .find(".suggestions-text")
                        .html(name);
                    $(this)
                        .find(".suggestions-category")
                        .html(" in " + currentMatches[index].type);
                } else {
                    $(this).hide();
                }
            });
        });

        //Handle up/down/enter
        $searchbox.keydown(function(e) {
            if (e.which == 38) {
                adjustCurrentHighlightedIndex(false);
            }
            if (e.which == 40) {
                adjustCurrentHighlightedIndex(true);
            }
            if (e.which == 13) {
                navigate($($suggestionsList.children().get(currentHighlightedIndex)).attr("url"));
            }
        });

        //Updates the current highlighted index and highlights the item in the list
        //Adjust boundaries, since 0th element is nomatch string
        var adjustCurrentHighlightedIndex = function(down) {
            if (down) { //down
                if (currentHighlightedIndex === currentMatchesLength)
                    currentHighlightedIndex = 1;
                else
                    currentHighlightedIndex++;
            } else { //up
                if (currentHighlightedIndex === 1)
                    currentHighlightedIndex = currentMatchesLength; //last item
                else
                    currentHighlightedIndex--;
            }
            $suggestionsList
                .children(".highlighted")
                .removeClass("highlighted");
            var $highlightedItem = $($suggestionsList.children().get(currentHighlightedIndex)).addClass("highlighted");
            $searchbox.val($highlightedItem.find(".suggestions-text").text());
        }
    };

    //Util function to Navigate using the given url
    var navigate = function(url) {
        window.location.href = url;
    };

    //Util function to load handlebar templates using sync ajax, 
    //can be precompiled for faster performance usingnode handlebars.js module
    var getTemplate = function(name) {
        if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
            $.ajax({
                url : '/templates/' + name + '.html',
                success : function(data) {
                    if (Handlebars.templates === undefined) {
                        Handlebars.templates = {};
                    }
                    Handlebars.templates[name] = Handlebars.compile(data);
                },
                async : false
            });
        }
        return Handlebars.templates[name];
    };

    var $searchbox = $(".main-content input");
    //var $searchbox2 = $(".secondary-content input");

    new Suggestions($searchbox, "/data/products.json", {
        MAX_SUGGESTIONS: 10
    });
    //new Suggestions($searchbox2, "/products.json", {MAX_SUGGESTIONS : 5});
});