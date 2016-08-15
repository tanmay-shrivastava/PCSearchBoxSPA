$(function() {
    // Jquery style component, that takes an input box, src url (whose data is fetched only once), options
    // to add a suggestions panel to any input box
    var Suggestions = function($searchbox, url, options) {

        var MAX_SUGGESTIONS = options.MAX_SUGGESTIONS;
        var products = [];
        var currentMatchesLength = 0;
        var currentHighlightedIndex = -1;

        //Create ul and add it as a sibling to the input box
        var $suggestionsList = $("<ul/>").addClass("suggestions-list");
        $searchbox.after($suggestionsList);

        //Create li elements space holders
        for (var i = 0; i < options.MAX_SUGGESTIONS; i++) {
            var li = $('<li/>')
		                .addClass('suggestions-item')
		                .attr('url', "")
		                .appendTo($suggestionsList)
		                .hover(
		                    function() {
		                        $(this).addClass("highlighted");
		                    },
		                    function() {
		                        $(this).removeClass("highlighted");
		                    }
		                ).click(function(e) {
		                    navigate($(this).attr("url"));
		                });
        }

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
                $suggestsionsList.hide();
                return;
            }
            var currentMatches = products.filter(function(product, index) {
                var found = product.name.toLocaleLowerCase().search(val);
                return found >= 0;
            });

            currentMatchesLength = Math.min(currentMatches.length, MAX_SUGGESTIONS);
            if (currentMatchesLength > 0) {
                $suggestionsList.show();
            }
            $suggestionsList.find("li").each(function(index) {
                if (index < currentMatchesLength) { //make visible and change val
                    var name = currentMatches[index].name;
                    name = name.replace($searchbox.val(), ("<b>" + $searchbox.val() + "</b>"));
                    $(this)
                        .show()
                        .html("<span class=\"suggestion-text\">" + name + "</span><span class=\"suggestion-category\">" + " in " + currentMatches[index].type + "<span>")
                        .attr("url", currentMatches[index].url).css({
                            display: "block"
                        });
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
        var adjustCurrentHighlightedIndex = function(down) {
            if (down) { //down
                if (currentHighlightedIndex === currentMatchesLength - 1)
                    currentHighlightedIndex = -1;
                else
                    currentHighlightedIndex++;
            } else { //up
                if (currentHighlightedIndex === -1)
                    currentHighlightedIndex = currentMatchesLength - 1; //last item
                else
                    currentHighlightedIndex--;
            }
            $suggestionsList
                .children(".highlighted")
                .removeClass("highlighted");
            var $highlightedItem = $($suggestionsList.children().get(currentHighlightedIndex)).addClass("highlighted");
            $searchbox.val($highlightedItem.text());
        }

        //Navigate using the given url
        var navigate = function(url) {
            window.location.href = url;
        };
    };

    var $searchbox = $(".main-content input");
    //var $searchbox2 = $(".secondary-content input");

    new Suggestions($searchbox, "/data/products.json", {
        MAX_SUGGESTIONS: 10
    });
    //new Suggestions($searchbox2, "/products.json", {MAX_SUGGESTIONS : 5});
});