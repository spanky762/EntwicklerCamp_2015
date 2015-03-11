package local.entwickler.photos;

import java.io.Serializable;
import java.util.TreeSet;

import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;
import lotus.domino.ViewEntry;
import lotus.domino.ViewNavigator;

import com.ibm.xsp.model.domino.DominoUtils;

public class ImageSet extends TreeSet<Image> implements Serializable {

	private static final long serialVersionUID = 1L;

	/**
	 * Zero-Argument Constructor
	 */
	public ImageSet() {
		this.reload();
	}

	public void load(String filepath, String viewname) {
		System.out.println("ImageSet.load(filepath, viewname)");
		System.out.println("filepath: " + filepath);
		System.out.println("viewname: " + viewname);

		Database database = null;
		View view = null;
		ViewNavigator navigator = null;
		ViewEntry viewentry = null;
		ViewEntry stupidRecycleHack = null;
		Document document = null;

		Session session = DominoUtils.getCurrentSession();
		try {
			database = session.getDatabase(session.getServerName(), filepath);
			view = database.getView(viewname);
			view.setAutoUpdate(false);
			navigator = view.createViewNav();
			viewentry = navigator.getFirstDocument();
			while (null != viewentry) {
				document = viewentry.getDocument();

				Image image = new Image(document);
				this.add(image);
				Utilities.incinerate(document);

				stupidRecycleHack = navigator.getNextDocument();
				Utilities.incinerate(viewentry);
				viewentry = stupidRecycleHack;
			}

		} catch (NotesException e) {
			System.out.println("**********");
			System.out.println("EXCEPTION in ImageSet.load(filepath, viewname");
			e.printStackTrace();
		} finally {
			Utilities.incinerate(document, stupidRecycleHack, viewentry,
					navigator, view, database);
		}
	}

	public void reload() {
		System.out.println("ImageSet.reload()");
		this.load("entwickler\\photos\\attachments.nsf",
				"lkp_attachmentsBySubject");
	}

}
